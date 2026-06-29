# bookini

Smart Floor Reservation System.

## Production Setup

### 1. Clone the repository

```bash
git clone https://github.com/wissemhammoudi/bookini.git
cd bookini
```

### 2. Create the `.env` file

Create a `.env` file at the root of the project:

```env
SEED_DEFAULT_USERS=true
SEED_SUPER_ADMIN_EMAIL=superadmin@bookiwa7dek.com
SEED_SUPER_ADMIN_PASSWORD=SuperAdmin123456!
SEED_ADMIN_EMAIL=admin@bookiwa7dek.com
SEED_ADMIN_PASSWORD=Admin123456!
SEED_USER_EMAIL=user@bookiwa7dek.com
SEED_USER_PASSWORD=User123456!

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=bookini
MINIO_SECURE=false

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin

# Production image tags
BACKEND_IMAGE=wissem020/bookini-backend:latest
FRONTEND_IMAGE=wissem020/bookini-frontend:latest
ADMIN_FRONTEND_IMAGE=wissem020/bookini-admin-frontend:latest

GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

> **Note:** Replace all default credentials with strong values before going live.

### 3. Configure GitHub Actions secrets

The CI/CD pipeline requires the following secrets to be set in your GitHub repository (under **Settings → Secrets and variables → Actions**):

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SSH_HOST` | VPS hostname or IP |
| `SSH_USER` | SSH login user |
| `SSH_PRIVATE_KEY` | SSH private key |
| `SSH_PASSPHRASE` | SSH key passphrase |
| `SSH_PORT` | SSH port (default: 22) |
| `SSH_TARGET_DIR` | Deployment directory on the VPS |
| `DOMAIN_NAME` | Production domain name |
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `SECRET_KEY` | Application secret key |
| `GRAFANA_ADMIN_USER` | Grafana admin username |
| `GRAFANA_ADMIN_PASSWORD` | Grafana admin password |
| `FRONTEND_URL` | Public URL of the user frontend |
| `ADMIN_FRONTEND_URL` | Public URL of the admin frontend |

### 4. Deploy

The CI/CD pipeline (`.github/workflows/ci.yml`) handles deployment automatically:

- **Pull Request → `master`**: runs lint, tests, and dependency audits.
- **Push → `master`**: quality gates → Docker image build & push to Docker Hub → vulnerability scan → staging deploy → smoke tests.
- **Production deploy**: runs only after staging succeeds and requires GitHub Environment approval.

To trigger a manual production deploy, approve the pending environment gate in the **Actions** tab of your repository.
