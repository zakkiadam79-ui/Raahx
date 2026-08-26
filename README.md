# RaahX

## Run locally

Prerequisites:

- Node.js 20+
- PHP 8+ with PDO MySQL enabled
- Access to a development MySQL database when testing API-backed features

1. Install the locked frontend dependencies:

   ```bash
   npm ci
   ```

2. Configure the existing PHP API for your local development database by
   copying `api/config/config.example.php` to the ignored
   `api/config/config.php`, or export the documented `RAAHX_*` environment
   variables. Never commit credentials.

3. Start the frontend and the existing PHP API together:

   ```bash
   npm run dev
   ```

`npm run dev` starts PHP on `127.0.0.1:8000` and Vite on its normal development
port. Vite proxies same-origin browser requests from `/api/*` to that PHP
process. Production continues to use `/api` through Apache/LiteSpeed and
`api/.htaccess`; no production API URL changes are required.

To run either process separately, use `npm run dev:frontend` or
`npm run dev:api`.
