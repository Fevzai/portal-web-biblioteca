# Notas de entorno (Base44)

Este repo contiene **solo el backend** (API Express) en `Backend/`. No hay frontend:
el puerto 3000 sirve la API y la raíz `/` devuelve un mensaje de estado.

## Cómo se ejecuta aquí

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- `db`: PostgreSQL con pgvector (`pgvector/pgvector:pg16`). Se levanta con SSL y un
  certificado autofirmado generado en el arranque, porque `Backend/src/config/db.js`
  siempre negocia SSL (`rejectUnauthorized: false`), como hacía contra Supabase.
- `migrate`: servicio de una sola ejecución que aplica `Backend/db/01_schema.sql` y
  `Backend/db/02_seed.sql`. El repositorio original no incluía migraciones; el
  esquema se reconstruyó desde las consultas de `src/services` y los nombres de
  constraint que esperan los controladores (p. ej. `evento_un_lugar`, `foto_publicable`).
  Ambos scripts son idempotentes.
- `api`: imagen `node:22` con `Backend/` montado; `npm ci` al arrancar y
  `node --watch src/server.js` para recarga en caliente.

## Detalles no obvios

- `kb_fragmentos.embedding` es `extensions.vector(1536)` y la extensión vive en el
  esquema `extensions` (como en Supabase). El esquema fija
  `search_path = public, extensions` a nivel de base de datos: sin eso, `<=>` no
  resuelve y `POST /api/kb-fragmentos/buscar` devuelve 500.
- `kb_fragmentos` no tiene ruta `GET /`; sus endpoints son
  `/api/kb-fragmentos/documento/:documentoId` y `POST /api/kb-fragmentos/buscar`.
- La búsqueda de texto (`?buscar=`) usa `plainto_tsquery('spanish', …)` sobre
  columnas generadas `busqueda`; responde a términos que comparten raíz
  (`lectura` sí, `encuadernacion` no coincide con `encuadernación`).
- El arranque del proceso `api` falla (`process.exit(1)`) si la base no responde;
  por eso depende de `db` sana y de `migrate` completado.

## Verificación rápida

```bash
curl -s http://localhost:3000/                       # 200
curl -s http://localhost:3000/api/eventos            # eventos publicados de ejemplo
docker compose -f docker-compose.base44.yml ps       # api y db healthy
```
