CORRECCIÓN DE MINEXCEL: CONEXIÓN REAL CON EL JSON

El componente src/MiniExcel.jsx ahora importa ../miniexcel-pixelart-niveles-21-30.json.
Los niveles 21-30 usan pixelColorAt() para obtener el color de cada celda. Esa función alimenta tanto el modelo pequeño como el mapa de objetivos del tablero, evitando que se siga usando la plantilla antigua de 8x8.

Se mantiene el patrón JSON de 12x12 y se incluyen en la paleta los colores usados por los patrones, incluyendo celeste.

Instalación local:
1. Descomprimir el ZIP.
2. Copiar el .env de la instalación actual (no se incluye por seguridad).
3. Abrir una terminal en la carpeta del proyecto.
4. Ejecutar npm install
5. Ejecutar npm run build
6. Ejecutar npm run dev

Nota de validación: en el entorno de preparación no fue posible completar el build porque las dependencias opcionales de Vite/Rolldown presentes en node_modules no incluyen el binding nativo necesario. Reinstalar dependencias con npm install en el equipo del usuario antes de publicar.
