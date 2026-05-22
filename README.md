# Curso Reporteros CEPABOL

Página de curso creada con Next.js que solicita nombre completo y edad, muestra un carrusel de videos integrados de YouTube y presenta preguntas paso a paso.

## Pasos para iniciar

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia el archivo `.env.local` con tus variables para Turso.
3. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```

## Configuración de Turso

1. Instala y configura Turso en tu máquina:
   - `turso login`
   - `turso db create curso_reporteros`
   - `turso db connect curso_reporteros`

2. Crea las tablas necesarias:
   ```sql
   CREATE TABLE users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     age INTEGER NOT NULL,
     created_at TEXT NOT NULL
   );

   CREATE TABLE answers (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER NOT NULL,
     question_id INTEGER NOT NULL,
     answer TEXT NOT NULL,
     created_at TEXT NOT NULL
   );

   CREATE TABLE topic_scores (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER NOT NULL,
     topic_index INTEGER NOT NULL,
     topic_name TEXT NOT NULL,
     score INTEGER NOT NULL,
     total INTEGER NOT NULL,
     created_at TEXT NOT NULL
   );
   ```

3. Exporta las variables de entorno necesarias en `.env.local`:
   ```env
   TURSO_API_BASE_URL=libsql://cursoreporteros-wilmerapaza.aws-ap-south-1.turso.io
   TURSO_API_KEY=tu_api_key_de_turso
   TURSO_DB_NAME=curso_reporteros
   ```

> `TURSO_API_BASE_URL` debe ser la URL `libsql://...` que te da Turso, no una URL HTTP.

4. Actualiza las rutas API en `app/api/login/route.ts` y `app/api/submit-answer/route.ts` para usar tu conexión Turso.

## Validación con Google Sheets

1. Publica tu hoja de cálculo o al menos la pestaña con la columna `NOMBRE Y APELLIDOS (Para el certificado)`.
2. Agrega estas variables a tu `.env.local`:
   ```env
   GOOGLE_SHEET_ID=tu_id_del_sheet
   GOOGLE_SHEET_TAB_NAME=NombreDeLaPestaña
   GOOGLE_SHEET_RANGE=B2:B
   ```
3. Si tu hoja está pública, el backend buscará el nombre completo en la columna B antes de permitir el acceso.

## Notas sobre los videos de YouTube

- Los videos se cargan como `iframe` embebidos desde `youtube-nocookie.com`.
- Esto reduce la posibilidad de que el usuario navegue directamente a YouTube, pero no puede garantizarlo al 100%.
- Para reforzar el control, no se permite pantalla completa desde el iframe.

## Estructura principal

- `app/page.tsx` - página principal con flujo de login, carrusel y preguntas.
- `app/globals.css` - estilos globales.
- `app/api/login/route.ts` - ruta API para guardar nombre y edad.
- `app/api/submit-answer/route.ts` - ruta API para guardar respuestas.
- `app/api/submit-score/route.ts` - ruta API para guardar notas de los cuestionarios.
- `data/questions.json` - preguntas de selección múltiple para cada tema (3 por tema).
- `lib/turso.ts` - funciones para `topic_scores` (guardar y obtener notas por tema).
