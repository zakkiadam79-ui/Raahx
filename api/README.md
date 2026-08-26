# RaahX PHP API Foundation

This directory contains the PHP REST API for the MySQL schema in `database/schema.sql`.

The production React frontend uses this API for application data, newsletter subscriptions, proposals, blog view counts, and PHP authentication. The existing localStorage/static data flow remains available as a deliberate fallback if an API read is unavailable. `VITE_API_BASE_URL` is only needed when the PHP API is hosted on a separate origin; same-origin deployments use `/api`.

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
- `RAAHX_SESSION_COOKIE`
- `RAAHX_SESSION_TTL`
- `ADMIN_SECRET`
- `APP_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `MAIL_TO`

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
- `GET /api/blog-views/popular?limit=3`

Public writes:

- `POST /api/creator-media/application` (rate-limited image upload)
- `POST /api/subscribers`
- `POST /api/proposals`
- `POST /api/blog-views/{slug}`

Authenticated reads/actions:

- `GET /api/subscribers`
- `POST /api/notify-subscribers`

Authenticated writes:

- `POST /api/creator-media/admin`
- `POST /api/creator-media/creator` (Creator magic-link token)
- `POST`, `PUT`, `DELETE /api/services...`
- `POST`, `PUT`, `DELETE /api/team...`
- `POST`, `PUT`, `DELETE /api/blogs...`
- `POST`, `PUT`, `DELETE /api/case-studies...`

Authentication foundation:

- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

Authenticated migration foundation:

- `POST /api/migration/validate`
- `POST /api/migration/import`
- `POST /api/migration/import?dry_run=1`

Migration endpoints accept the versioned JSON export produced by
`src/services/migrationExport.ts`. The utility reads the complete normalized
browser dataset, validates it, and exposes `downloadMigrationPayload()` for a
local JSON backup. It does not connect normal frontend rendering to the API.

The API validates stable IDs, slugs, child records, and service relationships
before importing. Imports upsert records by preserved IDs inside one
transaction and do not delete parents missing from the payload.

All responses use `{ "success": true, "data": ... }` or a structured error response.

## Creator media storage

Creator profile and Featured Work cover images are uploaded through the existing
PHP API and stored under `api/uploads/creator-media/YYYY/MM`. The web-server
user must have write permission to `api/uploads`, while `api/uploads/.htaccess`
blocks executable script extensions and directory listing. Only server-verified
JPEG, PNG, and WebP files up to 5 MB are accepted; generated random filenames
are used instead of original names.

## Creator follower counts

`creators.followers` is recalculated from all `creator_socials.follower_count`
values after every Creator profile write. Each social row records
`follower_count_updated_at`. Manual updates remain available to Creators and
Admins because Instagram, TikTok, Facebook, and other platforms require
provider-specific approved applications, credentials, scopes, and sometimes
business-account permissions. No scraping or unofficial automation is used.
A scheduled provider refresh must not be enabled until those official API
credentials and permissions are configured for each provider.
