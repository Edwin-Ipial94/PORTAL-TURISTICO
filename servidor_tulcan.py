"""Portal cautivo turistico de Tulcan con API de contenido y subida de imagenes."""

import http.server
import json
import os
import re
import socket
import socketserver
import time
import base64
import sys
import hashlib
from urllib.parse import unquote, urlparse

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8080"))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_FILE = "index.html"
CONTENT_FILE = os.path.join(BASE_DIR, "content.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25MB: suficiente para imagenes y PDFs del portal
ALLOWED_UPLOAD_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif", ".pdf"
}

# Credenciales del panel admin.
# Siempre existe un fallback local para evitar bloqueo accidental.
DEFAULT_ADMIN_USER = "admin"
DEFAULT_ADMIN_PASS = "tulcan2026"
ADMIN_USER = os.environ.get("PORTAL_ADMIN_USER", DEFAULT_ADMIN_USER)
ADMIN_PASS = os.environ.get("PORTAL_ADMIN_PASS", DEFAULT_ADMIN_PASS)
ALLOW_DEFAULT_FALLBACK = os.environ.get("PORTAL_ALLOW_DEFAULT_FALLBACK", "").strip().lower() in {"1", "true", "yes"}

CAPTIVE_PATHS = {
    "/generate_204",
    "/gen_204",
    "/hotspot-detect.html",
    "/library/test/success.html",
    "/ncsi.txt",
    "/connecttest.txt",
    "/redirect",
    "/success.txt",
    "/canonical.html",
    "/fwlink",
}


class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        """Silencia desconexiones abruptas comunes en clientes móviles/captive checks."""
        exc = sys.exc_info()[1]
        if isinstance(exc, (ConnectionResetError, ConnectionAbortedError, BrokenPipeError)):
            return
        super().handle_error(request, client_address)


def ensure_dirs():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def default_content():
    return {
        "site": {
            "page_title": "Portal Turístico Tulcán",
            "brand": "Turismo Tulcán",
            "hero_title": "Portal turístico dinámico de Tulcán",
            "portal_info": "Portal local para difundir atractivos, rutas y servicios turísticos del cantón Tulcán.",
            "menu_inicio": "Inicio",
            "menu_servicios": "Servicios",
            "menu_lugares": "Atractivos",
            "menu_rutas": "Rutas",
            "menu_admin": "Admin",
            "services_title": "Servicios turísticos en línea",
            "services_hero_title": "Consulta servicios con una lectura más limpia, moderna y directa",
            "services_modal_title": "Consulta el detalle de cada servicio",
            "services_quick_note": "Selecciona una tarjeta inferior para abrir detalles y opciones disponibles.",
            "places_title": "Atractivos turísticos destacados",
            "places_lead": "Filtra por parroquia, categoría y jerarquía para una búsqueda precisa.",
            "routes_title": "Rutas sugeridas de acceso",
            "route_hero_kicker": "GUIA DE ACCESO",
            "route_hero_title": "Explora rutas con una lectura clara y profesional",
            "badges": [
                "Provincia: Carchi",
                "Cantón: Tulcán",
                "Modo local offline",
                "Gestión dinámica"
            ],
            "top_strip": [
                "Red Turística Tulcán",
                "Carchi - Tulcán",
                "Funciona sin internet"
            ],
            "services": [
                {"icon": "bi-map-fill", "title": "Atractivos", "text": "Lugares turísticos con detalle.", "link": "#lugares"},
                {"icon": "bi-signpost-split-fill", "title": "Rutas", "text": "Accesos recomendados.", "link": "#rutas"},
                {"icon": "bi-clock-fill", "title": "Horarios", "text": "Consulta por atractivo.", "link": "#lugares"},
                {"icon": "bi-file-earmark-pdf-fill", "title": "Fichas", "text": "Documentos PDF oficiales.", "link": "#lugares"}
            ],
        },
        "hero_slides": [
            {"image": "IMAGES/CEMENTERIO DE TULCAN/DSC_0549.jpg", "caption": "Cementerio de Tulcán - Jardines topiarios"},
            {"image": "IMAGES/CEMENTERIO DE TULCAN/images.jpg", "caption": "Acceso principal"},
            {"image": "IMAGES/CEMENTERIO DE TULCAN/located-in-tulcan-on.jpg", "caption": "Panorámica del atractivo"},
        ],
        "places": [],
    }


def ensure_content_file():
    if os.path.exists(CONTENT_FILE):
        return
    with open(CONTENT_FILE, "w", encoding="utf-8") as f:
        json.dump(default_content(), f, ensure_ascii=False, indent=2)


def _clean_string(value):
    if value is None:
        return ""
    return str(value).strip()


def _clean_string_list(values):
    if not isinstance(values, list):
        return []
    return [str(v).strip() for v in values if str(v).strip()]


def _normalize_service(item):
    if not isinstance(item, dict):
        item = {}
    return {
        "title": _clean_string(item.get("title")),
        "text": _clean_string(item.get("text")),
        "modal_title": _clean_string(item.get("modal_title")),
        "icon": _clean_string(item.get("icon")),
        "link": _clean_string(item.get("link")),
        "mode": _clean_string(item.get("mode") or "normal"),
        "items": _clean_string_list(item.get("items")),
    }


def _normalize_slide(item):
    if not isinstance(item, dict):
        item = {}
    out = {
        "image": _clean_string(item.get("image")),
        "caption": _clean_string(item.get("caption")),
    }

    place_index = item.get("place_index", "")
    if place_index in (None, ""):
        out["place_index"] = ""
    else:
        try:
            out["place_index"] = int(place_index)
        except (TypeError, ValueError):
            out["place_index"] = _clean_string(place_index)

    place_name = _clean_string(item.get("place_name"))
    if place_name:
        out["place_name"] = place_name
    return out


def _normalize_place(item):
    if not isinstance(item, dict):
        item = {}

    normalized = {}
    for key, value in item.items():
        if key == "images":
            normalized["images"] = _clean_string_list(value)
        else:
            normalized[key] = _clean_string(value)

    normalized.setdefault("num_atr", "")
    normalized.setdefault("nombre", "")
    normalized.setdefault("provincia", "")
    normalized.setdefault("canton", "")
    normalized.setdefault("parroquia", "")
    normalized.setdefault("categoria", "")
    normalized.setdefault("tipo", "")
    normalized.setdefault("subtipo", "")
    normalized.setdefault("jerarquia", "")
    normalized.setdefault("estado", "")
    normalized.setdefault("pdf", "")
    normalized.setdefault("duracion", "")
    normalized.setdefault("distancia", "")
    normalized.setdefault("tiempo_auto", "")
    normalized.setdefault("coordenadas", "")
    normalized.setdefault("mini_foto", "")
    normalized.setdefault("ruta", "")
    normalized.setdefault("horario", "")
    normalized.setdefault("costo", "")
    normalized.setdefault("servicios", "")
    normalized.setdefault("recomendaciones", "")
    normalized.setdefault("resena", "")
    normalized.setdefault("ubicacion_ref", "")
    normalized.setdefault("mejor_visita", "")
    normalized.setdefault("contacto", "")
    normalized.setdefault("images", [])
    return normalized


def normalize_content_data(data):
    base = default_content()
    if not isinstance(data, dict):
        data = {}

    site_in = data.get("site")
    if not isinstance(site_in, dict):
        site_in = {}

    site = dict(base["site"])
    for key in list(site.keys()):
        if key == "services":
            site["services"] = [_normalize_service(x) for x in site_in.get("services", []) if isinstance(x, dict)]
        elif key in ("top_strip", "badges"):
            site[key] = _clean_string_list(site_in.get(key))
        else:
            incoming = site_in.get(key)
            if incoming is not None:
                site[key] = _clean_string(incoming)

    hero_slides = [_normalize_slide(x) for x in data.get("hero_slides", []) if isinstance(x, dict)]
    places = [_normalize_place(x) for x in data.get("places", []) if isinstance(x, dict)]

    return {
        "site": site,
        "hero_slides": hero_slides,
        "places": places,
    }


def load_content():
    ensure_content_file()
    try:
        with open(CONTENT_FILE, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        backup_path = CONTENT_FILE + f".broken-{int(time.time())}"
        try:
            if os.path.exists(CONTENT_FILE):
                os.replace(CONTENT_FILE, backup_path)
        except OSError:
            pass
        data = default_content()
        save_content(data)
    cleaned = normalize_content_data(data)
    if cleaned != data:
        save_content(cleaned)
    return cleaned


def save_content(data):
    cleaned = normalize_content_data(data)
    temp_file = CONTENT_FILE + ".tmp"
    with open(temp_file, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(temp_file, CONTENT_FILE)


def sanitize_filename(name):
    base = os.path.basename(name or "archivo")
    base = re.sub(r"[^a-zA-Z0-9._-]", "_", base)
    if not base:
        base = "archivo"
    return base


def parse_multipart_file(headers, raw_body, field_name="file"):
    """Extrae (filename, bytes) desde multipart/form-data sin depender de cgi."""
    ctype = headers.get("Content-Type", "")
    match = re.search(r'boundary="?([^";]+)"?', ctype)
    if not match:
        raise ValueError("Missing multipart boundary")

    boundary = match.group(1).encode("utf-8")
    marker = b"--" + boundary
    parts = raw_body.split(marker)
    for part in parts:
        part = part.lstrip(b"\r\n")
        if not part or part.startswith(b"--"):
            continue

        head_body = part.split(b"\r\n\r\n", 1)
        if len(head_body) != 2:
            continue
        head_bytes, body = head_body
        headers_txt = head_bytes.decode("utf-8", errors="ignore")

        disposition = None
        for line in headers_txt.split("\r\n"):
            if line.lower().startswith("content-disposition:"):
                disposition = line
                break
        if not disposition:
            continue

        name_match = re.search(r'name=\"([^\"]+)\"', disposition)
        file_match = re.search(r'filename=\"([^\"]*)\"', disposition)
        if not name_match or name_match.group(1) != field_name or not file_match:
            continue

        filename = file_match.group(1)
        # Recorta unicamente el cierre CRLF del chunk multipart sin tocar el binario real.
        content = body
        if content.endswith(b"\r\n"):
            content = content[:-2]
        return filename, content

    raise ValueError("Missing file field")


def is_authorized(headers):
    """Valida cabecera Authorization Basic."""
    auth = headers.get("Authorization", "")
    if not auth.startswith("Basic "):
        return is_cookie_authorized(headers)
    token = auth.split(" ", 1)[1].strip()
    try:
        raw = base64.b64decode(token)
        try:
            decoded = raw.decode("utf-8")
        except UnicodeDecodeError:
            decoded = raw.decode("latin-1")
    except Exception:
        return False
    decoded = decoded.strip()
    valid = _valid_credentials()
    return decoded in valid


def _auth_hash(user, passwd):
    return hashlib.sha256(f"{user}:{passwd}".encode("utf-8")).hexdigest()


def _using_default_credentials():
    return ADMIN_USER == DEFAULT_ADMIN_USER and ADMIN_PASS == DEFAULT_ADMIN_PASS


def _valid_credentials():
    valid = {f"{ADMIN_USER}:{ADMIN_PASS}"}
    # Compatibilidad controlada: solo habilita fallback si no hay credenciales personalizadas
    # o si se activa explicitamente PORTAL_ALLOW_DEFAULT_FALLBACK=1.
    if _using_default_credentials() or ALLOW_DEFAULT_FALLBACK:
        valid.add(f"{DEFAULT_ADMIN_USER}:{DEFAULT_ADMIN_PASS}")
    return valid


def _valid_cookie_hashes():
    valid = {_auth_hash(ADMIN_USER, ADMIN_PASS)}
    if _using_default_credentials() or ALLOW_DEFAULT_FALLBACK:
        valid.add(_auth_hash(DEFAULT_ADMIN_USER, DEFAULT_ADMIN_PASS))
    return valid


def _build_session_cookie(token):
    attrs = [
        f"portal_admin={token}",
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        "Max-Age=28800",  # 8 horas
    ]
    if os.environ.get("PORTAL_COOKIE_SECURE", "").strip().lower() in {"1", "true", "yes"}:
        attrs.append("Secure")
    return "; ".join(attrs)


def is_cookie_authorized(headers):
    cookie = headers.get("Cookie", "")
    if "portal_admin=" not in cookie:
        return False
    token = ""
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("portal_admin="):
            token = part.split("=", 1)[1].strip()
            break
    if not token:
        return False
    valid = _valid_cookie_hashes()
    return token in valid


class CaptivePortalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_json(self, payload, status=200):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _send_json_with_headers(self, payload, headers, status=200):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def _redirect_to_index(self):
        self.send_response(302)
        self.send_header("Location", f"/{INDEX_FILE}")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def _redirect_to_login(self):
        self.send_response(302)
        self.send_header("Location", "/login.html")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def _require_auth(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Admin Portal Tulcán"')
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Authentication required")

    def do_GET(self):
        raw_path = urlparse(self.path).path
        path = unquote(raw_path)

        # Protege el panel administrador.
        if path == "/admin.html":
            if not is_authorized(self.headers):
                return self._redirect_to_login()
            return super().do_GET()
        if path == "/login.html":
            return super().do_GET()

        if path == "/api/content":
            try:
                return self._send_json(load_content())
            except Exception as exc:
                return self._send_json({"ok": False, "error": str(exc)}, status=500)
        if path == "/api/admin-session":
            return self._send_json({"ok": True, "authorized": is_authorized(self.headers)})

        if path.startswith("/api/"):
            return self._send_json({"ok": False, "error": "API endpoint not found"}, status=404)

        if path in ("/", f"/{INDEX_FILE}"):
            return super().do_GET()

        requested = os.path.normpath(path.lstrip("/"))
        full_path = os.path.abspath(os.path.join(BASE_DIR, requested))
        if full_path.startswith(BASE_DIR) and os.path.isfile(full_path):
            return super().do_GET()

        if path in CAPTIVE_PATHS:
            return self._redirect_to_index()

        return self._redirect_to_index()

    def do_POST(self):
        raw_path = urlparse(self.path).path
        path = unquote(raw_path)

        if path == "/api/login":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length)
                data = json.loads(raw.decode("utf-8"))
                user = str(data.get("user", "")).strip()
                passwd = str(data.get("pass", "")).strip()
                if f"{user}:{passwd}" not in _valid_credentials():
                    return self._send_json({"ok": False, "error": "Credenciales incorrectas."}, status=401)
                token = _auth_hash(user, passwd)
                headers = {"Set-Cookie": _build_session_cookie(token)}
                return self._send_json_with_headers({"ok": True}, headers=headers)
            except Exception as exc:
                return self._send_json({"ok": False, "error": str(exc)}, status=400)

        # Solo admin puede modificar contenido o subir archivos.
        if path in ("/api/content", "/api/upload-image") and not is_authorized(self.headers):
            return self._require_auth()

        if path == "/api/content":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length)
                data = json.loads(raw.decode("utf-8"))
                if not isinstance(data, dict):
                    return self._send_json({"ok": False, "error": "Invalid JSON"}, status=400)
                save_content(data)
                return self._send_json({"ok": True})
            except Exception as exc:
                return self._send_json({"ok": False, "error": str(exc)}, status=400)

        if path == "/api/upload-image":
            try:
                ctype = self.headers.get("Content-Type", "")
                if "multipart/form-data" not in ctype:
                    return self._send_json({"ok": False, "error": "Use multipart/form-data"}, status=400)

                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0:
                    return self._send_json({"ok": False, "error": "Archivo vacio"}, status=400)
                if length > MAX_UPLOAD_BYTES:
                    return self._send_json({"ok": False, "error": "Archivo demasiado grande (max 25MB)"}, status=413)
                raw = self.rfile.read(length)
                original_filename, content = parse_multipart_file(self.headers, raw, field_name="file")
                ext = os.path.splitext(original_filename or "")[1].lower()
                if ext not in ALLOWED_UPLOAD_EXTENSIONS:
                    return self._send_json({"ok": False, "error": "Tipo de archivo no permitido"}, status=400)
                if len(content) > MAX_UPLOAD_BYTES:
                    return self._send_json({"ok": False, "error": "Archivo demasiado grande (max 25MB)"}, status=413)
                original_name = sanitize_filename(original_filename)
                ts = int(time.time() * 1000)
                filename = f"{ts}_{original_name}"
                out_path = os.path.join(UPLOAD_DIR, filename)

                with open(out_path, "wb") as f:
                    f.write(content)

                rel_path = f"uploads/{filename}"
                return self._send_json({"ok": True, "path": rel_path})
            except Exception as exc:
                return self._send_json({"ok": False, "error": str(exc)}, status=500)

        return self._send_json({"ok": False, "error": "API endpoint not found"}, status=404)

    def log_message(self, fmt, *args):
        client_ip = self.client_address[0]
        request_line = args[0] if args else "-"
        print(f"[{client_ip}] {request_line}")


def get_local_ip():
    forced = os.environ.get("PORTAL_LOCAL_IP", "").strip()
    if forced:
        return forced
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        return "192.168.10.10"
    finally:
        sock.close()


def get_all_local_ips():
    """Lista IPv4 privadas detectadas para facilitar pruebas en router."""
    ips = set()
    preferred = get_local_ip()
    if preferred and preferred != "127.0.0.1":
        ips.add(preferred)

    try:
        host = socket.gethostname()
        for info in socket.getaddrinfo(host, None, socket.AF_INET):
            ip = info[4][0]
            if ip.startswith(("10.", "172.", "192.168.")) and ip != "127.0.0.1":
                ips.add(ip)
    except OSError:
        pass

    return sorted(ips)


def run_server():
    index_path = os.path.join(BASE_DIR, INDEX_FILE)
    if not os.path.exists(index_path):
        raise FileNotFoundError(f"No se encontro {INDEX_FILE} en {BASE_DIR}")

    ensure_dirs()
    ensure_content_file()

    ip = get_local_ip()
    all_ips = get_all_local_ips()
    print("=" * 60)
    print("Portal cautivo turístico de Tulcán")
    print("Red Ad-Hoc local")
    print("=" * 60)
    print(f"Directorio: {BASE_DIR}")
    print(f"Localhost:  http://localhost:{PORT}")
    print(f"Red local:  http://{ip}:{PORT}")
    if all_ips:
        print("IPs detectadas para red local:")
        for local_ip in all_ips:
            print(f"  - http://{local_ip}:{PORT}")
    print(f"Admin:      http://localhost:{PORT}/admin.html")
    print(f"Usuario admin: {ADMIN_USER}")
    print("Clave admin:   (PORTAL_ADMIN_PASS; fallback solo si no hay credenciales personalizadas o si PORTAL_ALLOW_DEFAULT_FALLBACK=1)")
    print("Cualquier URL sera redirigida a /index.html")
    print("Detener: Ctrl+C")
    print("=" * 60)

    with ReusableTCPServer((HOST, PORT), CaptivePortalHandler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    except Exception as exc:
        print(f"Error: {exc}")
