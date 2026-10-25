# MiniExcel: rediseño de niveles 21–30

- Nivel 21: corazón rosado.
- Nivel 22: capibara sobre agua.
- Nivel 23: abeja amarilla y negra.
- Nivel 24: fantasma con flor.
- Nivel 25: carita sonriente con corazones.
- Nivel 26: flor roja con tallo verde.
- Nivel 27: Pou.
- Nivel 28: dos caracoles azul y rosado.
- Nivel 29: Pac-Man.
- Nivel 30: cara de vaca.

Los diez patrones se representan mediante matrices de 8×8 centradas dentro de la cuadrícula de 12×12. La función `pixelLetterAt` es la única fuente de datos que usan tanto el modelo de referencia como el tablero grande y la validación (`buildPixelMap`). Por tanto, las posiciones coloreadas son compartidas.

Se añadió el color rosa a la paleta y se cambió la clave de guardado local a `pmd_miniexcel_progress_v3` para no restaurar los tableros pintados con los patrones anteriores. El progreso sigue siendo local al navegador y caduca después de dos horas.

Navegación: se conserva el botón de nivel anterior. El avance al siguiente nivel sigue apareciendo únicamente después de que el reto se comprueba como completado correctamente.

## Probar

1. Copiar el `.env` de la instalación actual (no incluido en este ZIP).
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Probar los niveles 21–30 y verificar modelo, colores y botón Comprobar.
