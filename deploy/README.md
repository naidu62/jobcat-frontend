# JobCat Frontend v2 — Deployment Runbook (do not deploy yet)

Target: https://jobcat.in  (frontend) -> talks to https://app.jobcat.in (Django API)

## 0. Prerequisites
- Node.js >= 18.18 on the server
- nginx installed; DNS A record for jobcat.in and www.jobcat.in points to this server
- Backend already live at https://app.jobcat.in with CORS allowing https://jobcat.in

## 1. Build on the server
    cd /home/venkat/projects/jobcat-frontend
    cp deploy/env.production.example .env.production   # review values first
    npm ci --omit=dev=false
    npm run build

`next.config.js` uses `output: "standalone"` — the build produces
`.next/standalone/server.js`.

## 2. Install systemd service
    sudo cp deploy/jobcat-frontend.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now jobcat-frontend.service
    curl -s http://127.0.0.1:3000/robots.txt   # sanity check

Note: the standalone server does NOT read .env.production at runtime —
NEXT_PUBLIC_* values are baked into the bundle at build time. Only PORT /
HOSTNAME / NODE_ENV are runtime concerns here.

## 3. Install nginx
    sudo cp deploy/nginx-jobcat.conf /etc/nginx/sites-available/jobcat.in
    sudo ln -sf /etc/nginx/sites-available/jobcat.in /etc/nginx/sites-enabled/
    sudo certbot --nginx -d jobcat.in -d www.jobcat.in   # first time only
    sudo nginx -t && sudo systemctl reload nginx

## 4. Post-deploy verification checklist
    curl -s https://jobcat.in/robots.txt
    curl -s https://jobcat.in/sitemap.xml | head
    curl -s https://jobcat.in/ | grep '<title>'
    # register + login through the UI, confirm header shows Logout
    # open /jobs/<id> from a listing card once jobs exist in the backend

## 5. Rollback
    sudo systemctl stop jobcat-frontend
    # restore previous .next/ backup or git checkout previous tag, rebuild
    sudo systemctl start jobcat-frontend
