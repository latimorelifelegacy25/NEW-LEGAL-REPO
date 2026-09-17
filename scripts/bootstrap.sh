#!/usr/bin/env bash
set -euo pipefail
python -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -e ".[dev]"
echo "Environment ready."
