"""Install supplied ZIPs without committing private package contents."""

import argparse
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from services.registry.skill_import import import_packages


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destination", type=Path, required=True)
    parser.add_argument("archives", type=Path, nargs="+")
    args = parser.parse_args()
    for name in import_packages(args.archives, args.destination):
        print(name)
