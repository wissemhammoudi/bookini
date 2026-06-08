from datetime import UTC, datetime


def readiness_snapshot() -> dict[str, object]:
    checks = {
        "database": {"ready": True, "detail": "placeholder - Week 2 will add DB check"},
        "redis": {"ready": True, "detail": "placeholder - Week 2 will add Redis check"},
    }

    all_ready = all(item["ready"] for item in checks.values())

    return {
        "status": "ready" if all_ready else "not_ready",
        "timestamp": datetime.now(UTC).isoformat(),
        "checks": checks,
    }
