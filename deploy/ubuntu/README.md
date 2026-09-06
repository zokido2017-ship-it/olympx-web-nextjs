# Ubuntu Server setup (Olympx / Aurora Identity)

Self-host this Next.js app on **Ubuntu 22.04 or 24.04 LTS** with Node 22, systemd, and nginx.

The app is a Node server (`npm run build` then `next start`). Firebase Google + Phone OTP run in the browser, so you only need Node + a reverse proxy — no local Firebase emulator or database.

## What you need

- A VPS with Ubuntu 22.04/24.04, sudo, and SSH
- At least **1 GB RAM** (2 GB is more comfortable for `next build`; the installer adds swap on small boxes)
- A domain pointing at the server (for HTTPS)
- A Firebase project with **Google** and **Phone** auth enabled

## One-time install

SSH in as a sudo user, then:

```bash
sudo apt-get update
sudo apt-get install -y git
sudo mkdir -p /opt/olympx
sudo git clone https://github.com/zokido2017-ship-it/olympx-web-nextjs.git /opt/olympx
cd /opt/olympx

# Replace with your public hostname
sudo DOMAIN=app.example.com bash deploy/ubuntu/install.sh
```

The installer:

1. Installs Node.js 22, nginx, certbot, and build tools
2. Creates a `olympx` system user
3. Copies `.env.example` → `.env.production` if missing
4. Runs `npm ci` and `npm run build`
5. Enables `olympx.service` on port **3000** (loopback only)
6. Puts nginx in front on ports 80/443
7. Opens UFW for SSH, HTTP, and HTTPS

### Firebase env (required for login)

`NEXT_PUBLIC_*` values are compiled into the client bundle at **build** time.

```bash
sudo -u olympx nano /opt/olympx/.env.production
```

Paste the web `firebaseConfig` keys from Firebase Console → Project settings → Your apps.

Then rebuild and restart:

```bash
sudo bash /opt/olympx/deploy/ubuntu/update.sh
```

In Firebase Console → Authentication → Settings → **Authorized domains**, add your domain (and the server hostname). Enable **Google** and **Phone** providers. SMS may require billing.

### HTTPS

After DNS A/AAAA records point at the VPS:

```bash
sudo certbot --nginx -d app.example.com
```

Certbot renews via a systemd timer.

## Day-to-day

| Task | Command |
|------|---------|
| Status | `sudo systemctl status olympx` |
| Logs | `sudo journalctl -u olympx -f` |
| Pull + rebuild + restart | `sudo bash /opt/olympx/deploy/ubuntu/update.sh` |
| Nginx test/reload | `sudo nginx -t && sudo systemctl reload nginx` |

## Manual path (no installer)

If you prefer to do it by hand:

```bash
# Node 22 (do not use Ubuntu's default nodejs package — it is too old)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git build-essential

git clone https://github.com/zokido2017-ship-it/olympx-web-nextjs.git
cd olympx-web-nextjs
cp .env.example .env.production   # fill Firebase keys
npm ci
npm run build
LISTEN_HOST=127.0.0.1 PORT=3000 ./scripts/run-production.sh
```

Keep that process alive with systemd (`deploy/ubuntu/olympx.service`) and proxy it with `deploy/ubuntu/nginx.conf`.

## Notes

- Next.js listens on `127.0.0.1:3000`. Do not expose 3000 on the public firewall.
- Changing `.env.production` requires a rebuild (`update.sh`), not only a service restart.
- Phone OTP / Google sign-in will fail until the production domain is in Firebase authorized domains.
