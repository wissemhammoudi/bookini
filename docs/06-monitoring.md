# 06 – Monitoring & Observability

## Overview

Bookini ships with a complete observability stack to monitor application health, performance, and log activity. It is configured in the `monitoring/` directory and integrated into `docker-compose.yml`.

```
monitoring/
├── grafana/        # Dashboards & datasource provisioning
├── loki/           # Log aggregation config
├── prometheus/     # Scrape targets & alerting rules
└── promtail/       # Log forwarding from containers to Loki
```

---

## Stack Components

| Component | Role | Port |
|-----------|------|------|
| **Prometheus** | Metrics collection & storage | 9090 |
| **Grafana** | Metrics & log visualisation | 3000 |
| **Loki** | Log aggregation backend | 3100 |
| **Promtail** | Log forwarder (reads Docker stdout/stderr) | — |
| **cAdvisor** | Container resource usage metrics | 8080 |
| **Node Exporter** | Host system metrics (CPU, RAM, disk) | 9100 |

---

## Prometheus

**Config location:** `monitoring/prometheus/prometheus.yml`

Prometheus scrapes metrics from:

| Target | Endpoint | Interval |
|--------|----------|----------|
| FastAPI Backend | `backend:8000/metrics` | 15s |
| cAdvisor | `cadvisor:8080/metrics` | 15s |
| Node Exporter | `node-exporter:9100/metrics` | 15s |

### Backend Metrics

The backend exposes a Prometheus counter via `prometheus_client`:

```python
REQUEST_COUNT = Counter(
    "bookiwa7dek_http_requests_total",
    "Total HTTP requests processed by bookiwa7dek API",
    ["method", "path", "status_code"],
)
```

Every HTTP request increments this counter with labels for **method**, **path**, and **status_code**.

Access the raw metrics at: `http://localhost:8000/metrics`

---

## Grafana

**Config location:** `monitoring/grafana/`

Grafana is provisioned automatically with datasources and dashboards:

```
grafana/
├── provisioning/
│   ├── datasources/
│   │   └── datasources.yml     # Prometheus + Loki datasource config
│   └── dashboards/
│       └── dashboards.yml      # Dashboard provider config
└── dashboards/
    └── *.json                  # Pre-built dashboard JSON files
```

### Datasources

| Name | Type | URL |
|------|------|-----|
| Prometheus | Prometheus | `http://prometheus:9090` |
| Loki | Loki | `http://loki:3100` |

> **Note:** The Loki datasource has `manageAlerts: false` set to prevent Grafana from querying Loki's Ruler API (which is disabled), avoiding the "Rule Loading Error" banner.

### Dashboards

Pre-configured dashboards include:
- **System Overview** – CPU, memory, disk usage (via Node Exporter)
- **Container Metrics** – per-container CPU/RAM (via cAdvisor)
- **API Metrics** – request rate, error rate, status code breakdown (via Prometheus)
- **Application Logs** – searchable log viewer (via Loki)

**Access Grafana:** http://localhost:3000  
**Default credentials:** configured via `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` env vars.

---

## Loki

**Config location:** `monitoring/loki/loki-config.yml`

Loki is a log aggregation system. It stores logs indexed by labels (like container name, service) without full-text indexing, keeping storage minimal.

- Receives logs forwarded by **Promtail**.
- Grafana queries Loki using LogQL.

---

## Promtail

**Config location:** `monitoring/promtail/promtail-config.yml`

Promtail is the log shipping agent. It:
1. Reads Docker container stdout/stderr from `/var/lib/docker/containers/*/*.log`.
2. Attaches labels (container name, service, compose project).
3. Forwards log entries to Loki at `http://loki:3100`.

---

## Health Check

The backend exposes a health endpoint:

```
GET /api/v1/health
```

Returns `200 OK` when the application is running. Used by Docker health checks and uptime monitors.

---

## Structured Logging

The backend uses **structlog** for structured JSON log output.

```python
from app.core.logging_config import get_logger

logger = get_logger(__name__)
logger.info("Booking created", booking_ref="BK-2026-abc123", room_id=5)
```

Log output format in production (JSON):
```json
{
  "timestamp": "2026-06-25T10:30:00Z",
  "level": "info",
  "event": "Booking created",
  "booking_ref": "BK-2026-abc123",
  "room_id": 5,
  "service": "backend"
}
```

Log level is controlled by the `LOG_LEVEL` environment variable (`DEBUG`, `INFO`, `WARNING`, `ERROR`).

---

## Running the Monitoring Stack

```bash
# Start all services including monitoring
docker compose up -d

# Access Grafana
open http://localhost:3000

# Access Prometheus
open http://localhost:9090

# View raw API metrics
curl http://localhost:8000/metrics
```

---

*Next: [07-cicd.md](./07-cicd.md)*
