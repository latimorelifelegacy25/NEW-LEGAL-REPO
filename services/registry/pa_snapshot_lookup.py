"""Search dated Pennsylvania snapshots; verify current official sources before use."""

import argparse
from pathlib import Path
import re


FILES = {
    "chapter-43": "chapter-43-support-matters.txt",
    "chapter-63": "chapter-63-juvenile-matters.txt",
    "pa-constitution": "pa-constitution.txt",
    "pa-code-rules": "pa-code-rules-civil-procedure.txt",
    "title-18": "title-18-crimes.txt",
}


def find_section(text: str, section: str, *, rule: bool = False) -> tuple[str, int] | None:
    label = r"Rule\s+" if rule else r"§\s*"
    starts = list(re.finditer(label + re.escape(section) + r"\.\s", text, re.I))
    candidates = []
    for match in starts:
        following = re.search(label + r"\d+(?:\.\d+)*\.\s", text[match.end():], re.I)
        end = match.end() + following.start() if following else len(text)
        block = text[match.start():end].strip()
        candidates.append((len(re.sub(r"\s", "", block)), block, match.start()))
    if not candidates:
        return None
    _, block, position = max(candidates, key=lambda item: item[0])
    return block, position


def page_at(text: str, position: int) -> str:
    markers = list(re.finditer(r"^===== PAGE (\d+) =====$", text[:position], re.M))
    return markers[-1][1] if markers else "unknown"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", choices=FILES)
    parser.add_argument("--list-files", action="store_true")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--section")
    group.add_argument("--rule")
    group.add_argument("--keyword")
    parser.add_argument("--max-hits", type=int, default=5)
    args = parser.parse_args()
    if args.list_files:
        for name, filename in FILES.items():
            print(f"{name}: {filename}")
        return 0
    if not args.file or not (args.section or args.rule or args.keyword):
        parser.error("Provide --file and exactly one of --section, --rule, --keyword")
    if args.max_hits < 1:
        parser.error("--max-hits must be positive")
    if args.file == "pa-constitution" and (args.section or args.rule):
        parser.error("Constitution section numbers repeat; use --keyword and confirm the article")
    if args.rule and args.file != "pa-code-rules":
        parser.error("--rule requires --file pa-code-rules")
    text = (Path(__file__).resolve().parent.parent / "references" / FILES[args.file]).read_text(encoding="utf-8")
    print("OFFLINE SNAPSHOT: verify current official law before relying on this text.")
    if args.keyword:
        matches = list(re.finditer(re.escape(args.keyword), text, re.I))[:args.max_hits]
        for match in matches:
            print(f"PDF page: {page_at(text, match.start())}")
            print(text[max(0, match.start() - 400):match.end() + 400])
        return 0 if matches else 1
    number = args.rule or args.section
    # Preserve legacy --section usage for rule files while supporting --rule.
    result = find_section(text, number, rule=args.file == "pa-code-rules")
    if not result:
        print(f"Not found: {number}")
        return 1
    block, position = result
    print(f"PDF page: {page_at(text, position)}")
    print(block)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
