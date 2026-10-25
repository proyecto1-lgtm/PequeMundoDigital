# Corrección de MiniExcel: modelos pixel art

Esta revisión corrige los niveles 21–30 de MiniExcel.

- Cada modelo usa una matriz de 8 × 8 con filas de longitud uniforme.
- El mismo `pixelLetterAt()` alimenta el modelo de referencia y el tablero de 12 × 12.
- El dibujo se coloca centrado dentro del tablero grande, usando un desplazamiento de dos celdas en filas y columnas.
- Las celdas blancas se muestran en el modelo, pero no se exigen como acciones de pintado: el fondo del tablero ya es blanco.
- Las celdas de colores se validan con la misma matriz que genera el modelo.
- Se conserva la navegación para volver al nivel anterior y el guardado local temporal de progreso.
- Se cambia la clave de guardado a `pmd_miniexcel_progress_v3` para evitar reutilizar datos de progreso incompatibles de versiones anteriores.

## Probar

Conserva tu archivo `.env` actual en la carpeta del proyecto. Después ejecuta:

```powershell
npm install
npm run dev
```

Revisa los niveles 21–30, en especial el corazón (22), el perrito (24) y el osito (30). La instalación de dependencias agotó el tiempo disponible en el entorno de preparación, así que la compilación final debe verificarse en tu equipo antes de publicar en Render.
