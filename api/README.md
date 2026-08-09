# RaahX PHP API Foundation

This directory is the Step 5B PHP REST API foundation for the MySQL schema in `database/schema.sql`.

The React frontend is intentionally **not connected** to this API yet. The existing localStorage/static data flow remains active until the later migration step.

## Configuration

1. Create the MySQL database and run `database/schema.sql`.
2. Copy `config/config.example.php` to `config/config.php` on the PHP host, or provide the equivalent environment variables.
3. Set the server-only `ADMIN_SECRET` environment variable.
4. Configure `RAAHX_ALLOWED_ORIGINS` with the real production frontend origin. Comma-separated localhost origins are used by default for development.

`config/config.php` is ignored by Git. Never commit it or any real credentials.

Supported environment variables include:

- `APP_ENV` or `RAAHX_ENV`
- `RAAHX_DB_HOST`
- `RAAHX_DB_PORT`
- `RAAHX_DB_NAME`
- `RAAHX_DB_USER`
- `RAAHX_DB_PASSWORD`
- `RAAHX_ALLOWED_ORIGINS`
- `ADMIN_SECRET`
- `RAAHX_SESSION_COOKIE`
- `RAAHX_SESSION_TTL`

## Routing

`api/index.php` is the single API entry point. `api/.htaccess` rewrites resource paths to it on Apache/Hostinger.

Public reads:

- `GET /api/services`
- `GET /api/services/{id}`
- `GET /api/team`
- `GET /api/team/{id}`
- `GET /api/blogs`
- `GET /api/blogs/{id}`
- `GET /api/blogs/slug/{slug}`
- `GET /api/case-studies`
- `GET /api/case-studies/{id}`
- `GET /api/case-studies/slug/{slug}`

Authenticated writes:

- `POST`, `PUT`, `DELETE /api/services...`
- `POST`, `PUT`, `DELETE /api/team...`
- `POST`, `PUT`, `DELETE /api/blogs...`
- `POST`, `PUT`, `DELETE /api/case-studies...`

Authentication foundation:

- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

All responses use `{ "success": true, "data": ... }` or a structured error response.
