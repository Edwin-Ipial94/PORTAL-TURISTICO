# Estructura del proyecto

## Vista pública

- `index.html`: contiene la estructura principal del portal turístico.
- `assets/css/index.css`: estilos visuales del portal.
- `assets/js/index.js`: lógica de navegación, modales, filtros, visitas y carga de contenido.

## Panel administrativo

- `admin.html`: editor del contenido del portal.
- `login.html`: acceso al panel.

## Datos y servidor

- `content.json`: contenido dinámico del portal.
- `servidor_tulcan.py`: servidor y API que lee y guarda el contenido.

## Carpetas de apoyo

- `uploads`: imágenes y archivos subidos desde el panel.
- `IMAGES`, `INVENTARIO`, `FICHAS LUGARES TURISTICOS`: material de apoyo del proyecto.

## Idea general

El portal sigue funcionando como una sola aplicación, pero ahora el código quedó más ordenado:

- la estructura visual queda en `index.html`,
- la presentación en `assets/css/index.css`,
- la lógica en `assets/js/index.js`,
- la edición en `admin.html`,
- y el contenido editable en `content.json`.

Eso hace que sea más fácil de explicar, mantener y mejorar sin tocar la funcionalidad principal.
