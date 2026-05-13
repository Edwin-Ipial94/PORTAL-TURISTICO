# 🌿 GUÍA DE INSTALACIÓN - Portal Turístico Tulcán
## Red Ad Hoc con WAP4410N + Python

---

## 📁 PASO 1: Organiza los archivos

Crea una carpeta llamada `portal-tulcan` en tu escritorio y coloca dentro:

```
portal-tulcan/
├── index.html          ← (renombra tulcan-turismo.html)
└── servidor_tulcan.py
```

⚠️ IMPORTANTE: El archivo HTML debe llamarse exactamente `index.html`

---

## 🔌 PASO 2: Conexión de red

1. Conecta tu PC al WAP4410N por cable Ethernet
2. Verifica que tu PC tenga IP: 192.168.10.10
3. Verifica que el WAP tenga IP: 192.168.10.1

---

## ▶️ PASO 3: Iniciar el servidor

### Opción A — Doble clic (más fácil)
Haz doble clic en `servidor_tulcan.py`

### Opción B — Desde CMD (recomendado)
```
cd C:\Users\TuUsuario\Desktop\portal-tulcan
python servidor_tulcan.py
```

### Verás esto si funciona correctamente:
```
═══════════════════════════════════════════════════════
  🌿 SERVIDOR TURÍSTICO DE TULCÁN
═══════════════════════════════════════════════════════
  ✅ Servidor iniciado correctamente
  🌐 Dirección local:  http://localhost:8080
  📡 Red WAP (tu PC):  http://192.168.10.10:8080
═══════════════════════════════════════════════════════
```

---

## 📱 PASO 4: Probar desde otro dispositivo

1. Conecta un celular o laptop al WiFi del WAP4410N
2. Abre el navegador y escribe:
   ```
   http://192.168.10.10:8080
   ```
3. Debe aparecer la app turística de Tulcán ✅

---

## 🔧 SOLUCIÓN DE PROBLEMAS

| Problema | Solución |
|---|---|
| "No se encontró index.html" | Renombra el HTML a `index.html` |
| "Sin permisos para el puerto" | Ejecuta CMD como Administrador |
| El celular no carga la página | Desactiva el firewall de Windows temporalmente |
| Puerto ocupado | Cambia PORT = 8080 a PORT = 8888 en el script |

### Desactivar Firewall temporalmente (para pruebas):
```
Panel de control → Firewall → 
Activar o desactivar → Desactivar (red privada)
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
[Celular/Laptop del turista]
         ↓ WiFi
  [WAP4410N - 192.168.10.1]
         ↓ Cable Ethernet  
  [Tu PC - 192.168.10.10]
  [Python servidor_tulcan.py]
         ↓
  [index.html - App Turística]
```

---

## 📝 PARA LA TESIS

Este sistema implementa:
- ✅ Servidor HTTP local con Python (sin internet)
- ✅ Portal cautivo que redirige cualquier URL
- ✅ App turística responsiva (celulares y laptops)
- ✅ Bilingüe (Español / Inglés)
- ✅ Funciona 100% offline en red local

**Tecnologías usadas:**
- Python 3.x — `http.server` + `socketserver`
- HTML5 + CSS3 + JavaScript vanilla
- Red inalámbrica IEEE 802.11 b/g/n (WAP4410N)
