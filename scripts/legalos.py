#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from services.knowledge import build_index, search
from services.matters import list_matters
from services.registry import list_skills, verify_catalog
from services.workflow import list_workflows, prepare_run


def dump(value):
    print(json.dumps(value, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Latimore Legal OS local control CLI")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("status")
    sub.add_parser("skills")
    sub.add_parser("matters")
    sub.add_parser("workflows")
    sub.add_parser("index")
    p_search = sub.add_parser("search"); p_search.add_argument("query")
    p_run = sub.add_parser("prepare"); p_run.add_argument("workflow_id"); p_run.add_argument("--matter-id")
    args = parser.parse_args()

    if args.command == "status":
        dump({"catalog": verify_catalog(), "matters": len(list_matters()), "workflows": len(list_workflows())})
    elif args.command == "skills": dump(list_skills())
    elif args.command == "matters": dump(list_matters())
    elif args.command == "workflows": dump(list_workflows())
    elif args.command == "index": dump(build_index())
    elif args.command == "search": dump(search(args.query))
    elif args.command == "prepare":
        variables = {"matter_id": args.matter_id} if args.matter_id else {}
        dump(prepare_run(args.workflow_id, variables))

if __name__ == "__main__":
    main()
