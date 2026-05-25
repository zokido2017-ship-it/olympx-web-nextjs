# Aurora Identity — Next.js + Firebase (Google + Phone OTP)

Minimal auth: **Google popup** sign-in **or** **SMS OTP** (Firebase Phone Auth with invisible reCAPTCHA).

## Setup

```bash
npm install
cp .env.example .env.local   # fill Firebase web config
npm run dev
```

**Node:** ≥ 20.9 (`package.json` `engines`)

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home (navbar → Login) |
| `/login` | Google button + phone → OTP |
| `/verify-otp` | 6-digit code → dashboard |
| `/dashboard` | Signed-in hub (client-guarded) |

## Firebase console

Enable **Authentication** providers: **Google** and **Phone**. Add authorized domains (`localhost`, production). SMS may require billing and quotas; test phone numbers are supported in development.

## Env

See `.env.example` (`NEXT_PUBLIC_FIREBASE_*`).

## Olympx / Laravel API (phone auth proxy)

Some flows call a **Laravel** backend via `OLYMPEX_API_BASE_URL` (see `.env.example`). OTP requests run **on the API**, not inside Next.js.

### `could not find driver (Connection: pgsql, …)`

That message is from **PHP/Laravel** when `DB_CONNECTION=pgsql` is set but the PHP binary has **no PostgreSQL driver**:

1. Find the `php.ini` used by the same PHP that runs `php artisan serve` (`php --ini`).
2. Enable both lines (remove leading `;`):
   - `extension=pdo_pgsql`
   - `extension=pgsql`
3. **Windows:** ensure `libpq.dll` loads (often next to `php.exe`, or install PostgreSQL client libs and add its `bin` to PATH). Restart the terminal / web server.
4. **Linux:** e.g. `sudo apt install php-pgsql` (match your PHP version), then restart PHP-FPM or Apache.
5. Confirm: `php -m` should list `pdo_pgsql` and `pgsql`.

Alternatively, switch the Laravel `.env` to a database your PHP stack already supports (`mysql`, `sqlite`, etc.) and run migrations there.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy (Vercel)

Set env vars in the project dashboard; add domains under Firebase Authentication → Authorized domains.
