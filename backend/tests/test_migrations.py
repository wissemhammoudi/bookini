from pathlib import Path


def test_alembic_files_exist() -> None:
    root = Path(__file__).resolve().parents[1]

    assert (root / "alembic.ini").exists()
    assert (root / "alembic" / "env.py").exists()
    assert (root / "alembic" / "versions" / "0001_initial_schema.py").exists()
