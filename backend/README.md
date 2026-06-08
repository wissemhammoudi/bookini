# Backend - Week 1 Foundation

## Prerequisites

- Python 3.12+

## Setup

1. Create a virtual environment.
1. Install dependencies:

```bash
pip install -r requirements.txt
```

1. Install dev tooling:

```bash
pip install -r requirements-dev.txt
```

1. Copy `.env.example` to `.env` and adjust values.

## Run

```bash
uvicorn app.main:app --reload
```

## Verify endpoints

- `GET /health`
- `GET /ready`

## Run tests

```bash
pytest
```

## Pre-commit quality checks

Install hooks once:

```bash
pre-commit install
```

If this fails, initialize a repository first:

```bash
git init
```

Run checks manually on all files:

```bash
pre-commit run --all-files
```

This enforces:

- formatting
- linting
- import order

Fallback (without Git hooks):

```bash
ruff check .
ruff format .
```
