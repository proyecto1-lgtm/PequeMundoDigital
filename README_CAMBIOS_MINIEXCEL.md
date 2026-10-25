# Cambios de MiniExcel

- Los 10 patrones pixel art se generan desde la misma función `pixelLetterAt` para que el modelo de referencia y el tablero grande usen exactamente las mismas letras, filas y columnas.
- El tablero pixel art usa 12 x 12; el patrón ocupa sus primeras 8 x 8 celdas y las demás quedan blancas.
- El progreso de cada nivel se guarda por separado en el navegador durante un máximo de 2 horas, para que al volver atrás no se sobrescriba el progreso de otro nivel.
- Se agregó el botón «← Nivel anterior» únicamente en MiniExcel desde el nivel 2. No se agrega botón para avanzar manualmente; se avanza al completar el reto.

Para probar: conservar el `.env` del proyecto local, ejecutar `npm install` y `npm run dev`.
