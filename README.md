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

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy (Ubuntu server)

Self-host with Node 22, systemd, and nginx. Full steps: [`deploy/ubuntu/README.md`](deploy/ubuntu/README.md).

```bash
sudo git clone https://github.com/zokido2017-ship-it/olympx-web-nextjs.git /opt/olympx
cd /opt/olympx
sudo DOMAIN=app.example.com bash deploy/ubuntu/install.sh
sudo -u olympx nano /opt/olympx/.env.production   # Firebase web config
sudo bash /opt/olympx/deploy/ubuntu/update.sh
sudo certbot --nginx -d app.example.com
```

Add the domain under Firebase Authentication → Authorized domains.

## Deploy (Vercel)

Set env vars in the project dashboard; add domains under Firebase Authentication → Authorized domains.
