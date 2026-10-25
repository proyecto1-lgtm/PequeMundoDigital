# PequeMundo Digital — prototipo inicial

## Ejecutar en Windows
1. Instala Node.js LTS.
2. Descomprime la carpeta.
3. Abre una terminal dentro de `pequemundo-digital`.
4. Ejecuta `npm install`.
5. Ejecuta `npm run dev`.
6. Abre la URL local que indique Vite.

## Qué incluye este prototipo
- Pantalla inicial con nombres, apellidos y edades 3, 4 y 5 años.
- Dos juegos seleccionables.
- Estructura de 30 niveles por juego.
- Primeros 10 niveles del juego Mouse Mágico como práctica de trazado.
- Sonido opcional mediante voz del navegador.
- Panel docente de demostración y exportación CSV compatible con Excel.
- Registro local en el navegador.

## Importante: estado de prototipo
Los resultados se guardan únicamente en el navegador actual. Aún no se sincronizan entre casa y colegio. Antes de usarlo con estudiantes reales:
- Cambiar el acceso docente de demostración por autenticación segura.
- Configurar Supabase y políticas RLS.
- Implementar medición real del trazado sobre la guía; el porcentaje actual es una simulación de prototipo y NO debe usarse para calificar.
- Completar y validar las 60 actividades, sus criterios por edad y la lógica de calificación por las cuatro capacidades.
- Revisar accesibilidad, privacidad y pruebas en las computadoras del colegio.


## Supabase (sincronización casa/colegio)

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**, pega el contenido de `supabase_schema.sql` y ejecuta el script.
3. En **Project Settings > API**, copia Project URL y la clave `anon`/publishable (nunca uses `service_role` en React).
4. Crea `.env` en la raíz del proyecto copiando `.env.example` y completa:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. En Supabase > Authentication > Users, crea el usuario y contraseña del docente.
6. En la terminal, instala dependencias y reinicia Vite:
   ```bash
   npm install
   npm run dev
   ```
7. Abre **Panel docente** e inicia sesión con el usuario creado en Supabase. El panel consulta los registros remotos.
8. Completa un nivel de prueba. El resultado debe aparecer en `public.pmd_results` y luego en el panel docente.

La clave pública `anon` puede usarse en el frontend porque las tablas están protegidas por RLS. No publiques una clave `service_role`. La política permite insertar resultados sin iniciar sesión para que los estudiantes jueguen desde casa, pero solo usuarios autenticados pueden leer los resultados. Para producción, restringe además la creación de usuarios y protege el acceso al panel docente.
