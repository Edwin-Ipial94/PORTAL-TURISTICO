# Publicar gratis + QR (Portal Tulcán)

## 1) Subir a GitHub
1. Crea un repositorio en GitHub.
2. Sube esta carpeta `portal-tulcan`.

## 2) Publicar en Render (gratis)
1. Entra a `https://render.com` y crea cuenta.
2. `New` -> `Web Service`.
3. Conecta tu repositorio.
4. Configura:
   - `Runtime`: Python
   - `Build Command`: (vacío)
   - `Start Command`: `python servidor_tulcan.py`
5. Variables de entorno:
   - `PORTAL_ADMIN_USER` = tu usuario admin
   - `PORTAL_ADMIN_PASS` = tu clave admin fuerte
   - `PORTAL_ALLOW_DEFAULT_FALLBACK` = `0`
6. Deploy.

Cuando termine, Render te entrega una URL tipo:
`https://tu-app.onrender.com`

## 3) QR solo para el portal público (sin admin)
Usa el QR apuntando solo a la portada pública:
`https://tu-app.onrender.com/`

No uses:
- `/admin.html`
- `/login.html`

## 4) Generar imagen QR rápida
Abre en navegador esta URL (reemplaza TU_URL):

`https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=TU_URL`

Ejemplo:
`https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=https%3A%2F%2Ftu-app.onrender.com%2F`

Guarda esa imagen PNG y úsala en afiches o redes.

## 5) Nota importante
En hosting gratis, si guardas imágenes/PDF en disco local (`uploads`), se pueden perder al reiniciar o redeploy.
