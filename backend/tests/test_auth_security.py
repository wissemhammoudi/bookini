import os
import uuid

import pytest

os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key-with-minimum-length")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "7")

from app.core.security import (  # noqa: E402
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password() -> None:
    raw = "StrongPassword123"
    hashed = hash_password(raw)

    assert hashed != raw
    assert verify_password(raw, hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_contains_expected_claims() -> None:
    subject = str(uuid.uuid4())
    token = create_access_token(subject)

    payload = decode_token(token)
    assert payload["sub"] == subject
    assert payload["type"] == "access"


def test_refresh_token_contains_expected_claims() -> None:
    subject = str(uuid.uuid4())
    token = create_refresh_token(subject)

    payload = decode_token(token)
    assert payload["sub"] == subject
    assert payload["type"] == "refresh"


def test_password_reset_token_contains_expected_claims() -> None:
    subject = str(uuid.uuid4())
    token = create_password_reset_token(subject, expires_minutes=10)

    payload = decode_token(token)
    assert payload["sub"] == subject
    assert payload["type"] == "password_reset"


def test_invalid_token_raises_unauthorized() -> None:
    with pytest.raises(Exception):
        decode_token("this.is.not.a.valid.jwt")
