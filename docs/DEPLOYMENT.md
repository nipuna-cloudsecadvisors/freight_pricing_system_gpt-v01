# Production Deployment Guide (Ubuntu 24.04 LTS)

This guide walks through deploying the Freight Pricing & Activity System on a fresh Ubuntu 24.04 virtual machine. It assumes minimal prior DevOps experience and covers every step from preparing the server to running the application stack with Docker Compose.

> **Tip:** Execute each step as shown. Commands that require `sudo` will prompt for your password.

---

## 1. Prepare the server

### 1.1 Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install foundational utilities
```bash
sudo apt install -y build-essential curl git ufw ca-certificates lsb-release gnupg
```

### 1.3 (Optional) Configure a basic firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
> If prompted about proceeding with enabling UFW, answer `y`.

---

## 2. Install Docker Engine & Compose plugin

### 2.1 Add Docker’s official GPG key & repository
```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

### 2.2 Install Docker packages
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2.3 Enable and test Docker
```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo docker run --rm hello-world
```

### 2.4 Allow your user to run Docker without sudo (optional but recommended)
```bash
sudo usermod -aG docker $USER
# Log out and log back in for the change to take effect.
```

---

## 3. Clone the repository

### 3.1 Choose an installation directory
```bash
cd ~
```

### 3.2 Clone the project
```bash
git clone https://github.com/<your-org>/freight_pricing_system_gpt-v01.git
cd freight_pricing_system_gpt-v01
```
Replace `<your-org>` with the actual organisation or user namespace where the repository is hosted.

### 3.3 Checkout the desired branch or tag
```bash
git checkout main   # or the release tag provided by the engineering team
```

---

## 4. Configure environment variables

1. Duplicate the sample environment files:
   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   ```
2. Edit both `.env` files and provide production values:
   - Secure `JWT_SECRET` and `REFRESH_TOKEN_SECRET` with long random strings.
   - Configure database credentials (if you change the defaults defined in `docker-compose.yml`).
   - Update SMTP settings to point to your production email provider.
   - Set `SMS_GATEWAY_API_KEY` to your SMS provider credentials.
   - In `apps/web/.env`, set `VITE_API_BASE_URL` to the public URL where the API will be reachable (e.g. `https://freight.example.com/api`).

Use your editor of choice (`nano`, `vim`, or `code` via VS Code SSH) to modify the files, e.g.:
```bash
nano .env
```

---

## 5. Initialise application data

### 5.1 Install PNPM (used for one-time Prisma commands)
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
# Reload shell to pick up pnpm (depends on your shell; usually:
source ~/.bashrc
```

### 5.2 Install Node.js runtime via NodeSource (for pnpm tooling only)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 5.3 Install workspace dependencies and generate Prisma client
```bash
pnpm install --no-frozen-lockfile
pnpm prisma:generate
```

### 5.4 Run database migrations and seed data
```bash
pnpm prisma:migrate
pnpm prisma:seed
```
> These workspace scripts proxy to the API service's bundled Prisma CLI and connect to the database defined in `.env`. If you are using the Dockerised Postgres from `docker-compose.yml`, ensure the stack is running (next step) before seeding. For managed Postgres services, ensure the connection details are reachable from the VM.

---

## 6. Launch the production stack

### 6.1 Start services with Docker Compose
```bash
docker compose up -d --build
```
This command builds the API & web images, then starts all services (API, Web, PostgreSQL, Redis, Worker, Nginx proxy).

### 6.2 Check container health
```bash
docker compose ps
```
Ensure all services show the `Up` status. If any container exits, inspect logs:
```bash
docker compose logs <service-name>
```
Replace `<service-name>` with `api`, `web`, `postgres`, etc.

### 6.3 Access the application
- **Web UI:** `http://<server-ip>/` (served by Nginx)
- **API:** `http://<server-ip>/api`

If you configured HTTPS or a reverse proxy, replace `http` with `https` and use your domain name.

---

## 7. Post-deployment tasks

1. **Create initial admin user:**
   - Use the seed data credentials or run a SQL insert to create an admin in the `users` table.
   - Immediately change default passwords and enforce secure secrets.
2. **Configure DNS & TLS:**
   - Point your domain to the VM’s public IP.
   - Obtain TLS certificates (e.g. using [Certbot](https://certbot.eff.org/)).
3. **Set up log rotation & monitoring:**
   - Use `docker logs` or integrate with services like Loki, ELK, or any preferred logging solution.
   - Monitor container restarts via `docker compose ps` or a platform like Portainer.
4. **Schedule automated backups:**
   - Dump PostgreSQL regularly using `pg_dump`.
   - Backup `.env` files securely.
5. **Keep the system patched:**
   - Apply security updates: `sudo apt update && sudo apt upgrade -y`.
   - Periodically update Docker images: `docker compose pull` followed by `docker compose up -d`.

---

## 8. Managing the stack

| Action | Command |
| ------ | ------- |
| View logs for all services | `docker compose logs -f` |
| View logs for a single service | `docker compose logs -f api` |
| Restart services after config changes | `docker compose up -d --build` |
| Stop the stack | `docker compose down` |
| Remove containers + networks (keep volumes) | `docker compose down --remove-orphans` |
| Update environment variables | Edit `.env` files, then `docker compose up -d --build` |

---

## 9. Troubleshooting checklist

1. **Containers keep restarting** – Run `docker compose logs <service>` to view errors. Common causes include bad env vars, missing database, or port conflicts.
2. **Cannot connect to Postgres** – Confirm `DATABASE_URL` matches the credentials defined in `docker-compose.yml`. If using Docker Postgres, ensure the `postgres` service is `Up` and the port `5432` is not blocked by a firewall.
3. **Frontend cannot reach API** – Verify `VITE_API_BASE_URL` points to the Nginx URL (`http://nginx:80` inside Docker, external domain when accessed from browser). Check the `nginx` service configuration.
4. **Permission denied when running Docker** – Ensure your user is part of the `docker` group (Step 2.4) and re-login.
5. **pnpm command not found** – Ensure you sourced your shell profile (`source ~/.bashrc`) after installing pnpm.

---

## 10. Keeping documentation handy

Store this guide (or a customised version) alongside your internal SOPs. Encourage team members to follow it when provisioning new environments to ensure consistency.

Happy shipping!
