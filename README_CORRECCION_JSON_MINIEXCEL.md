# Corrección de MiniExcel: niveles 21–30

## Qué se corrigió
- `src/MiniExcel.jsx` importa `../miniexcel-pixelart-niveles-21-30.json`.
- Se eliminaron las plantillas pixel art duplicadas escritas dentro del componente.
- El modelo pequeño y el tablero principal leen la misma matriz del JSON.
- La validación usa las mismas celdas y colores de esa matriz.
- El blanco (`#FFFFFF`) se interpreta como fondo vacío, no como celda que el niño deba pintar.
- La paleta utiliza los mismos códigos hexadecimales que el JSON, incluido el celeste.
- Los niveles 1–20 conservan su lógica anterior.

## Ejecutar en Windows
1. Descomprime el proyecto.
2. Copia tu archivo `.env` anterior en la carpeta raíz del proyecto. No se incluye por seguridad.
3. Abre esa carpeta en VS Code.
4. En la terminal ejecuta `npm install`.
5. Ejecuta `npm run dev`.
6. Prueba el nivel 21: el modelo y el tablero deben coincidir en color y coordenadas.

## Nota de verificación
Se comprobó que el JSON contiene los niveles 21–30 y que cada patrón tiene 12 filas de 12 celdas. En este entorno no se pudo completar `npm install`, por lo que no se pudo ejecutar una compilación de Vite aquí. Verifica `npm run build` en tu equipo antes de publicar.
