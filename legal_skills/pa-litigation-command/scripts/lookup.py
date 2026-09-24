#!/usr/bin/env python3
"""Search dated Pennsylvania-law snapshots bundled with this skill.

This is an offline aid. Verify any filing citation against a current official
Pennsylvania source before relying on it.
"""

from __future__ import annotations
import argparse, re, sys
from pathlib import Path
BASE = Path(__file__).resolve().parent.parent / "references" / "offline-law"
SOURCES={"title-18":("18-pa-cs-crimes.txt","statute"),"support":("23-pa-cs-chapter-43-support.txt","statute"),"juvenile":("42-pa-cs-chapter-63-juvenile-matters.txt","statute"),"constitution":("pa-constitution.txt","constitution"),"rules-200":("231-pa-code-chapter-200-business-of-courts.txt","rule")}
def load(source):
    filename,kind=SOURCES[source]; path=BASE/filename; return path.read_text(encoding="utf-8"),kind,path
def page_at(text,position):
    matches=list(re.finditer(r"^===== PAGE (\d+) =====$",text[:position],re.MULTILINE)); return matches[-1].group(1) if matches else "unknown"
def clean(segment): return re.sub(r"[ \t]+"," ",segment).strip()
def longest_labeled_block(text,label_pattern,next_pattern):
    starts=list(re.finditer(label_pattern,text,re.IGNORECASE)); candidates=[]
    for start in starts:
        following=re.search(next_pattern,text[start.end():],re.IGNORECASE); end=start.end()+following.start() if following else len(text); block=text[start.start():end].strip(); score=len(re.sub(r"\s+","",block)); candidates.append((score,block,start.start()))
    if not candidates: return None
    _,block,position=max(candidates,key=lambda item:item[0]); return block,position
def find_statute(text,section): return longest_labeled_block(text,rf"§\s*{re.escape(section)}\.\s*",r"§\s*\d+(?:\.\d+)*\.\s*")
def find_rule(text,rule): return longest_labeled_block(text,rf"Rule\s+{re.escape(rule)}\.\s*",r"(?m)^Rule\s+\d+(?:\.\d+)*\.\s*")
def keyword_hits(text,phrase,context,maximum):
    hits=[]
    for match in re.finditer(re.escape(phrase),text,re.IGNORECASE):
        start=max(0,match.start()-context); end=min(len(text),match.end()+context); hits.append((clean(text[start:end]),match.start()))
        if len(hits)>=maximum: break
    return hits
def parser():
    ap=argparse.ArgumentParser(description=__doc__); ap.add_argument("--source",choices=sorted(SOURCES)); ap.add_argument("--section"); ap.add_argument("--rule"); ap.add_argument("--keyword"); ap.add_argument("--max-hits",type=int,default=5); ap.add_argument("--context",type=int,default=500); ap.add_argument("--list-sources",action="store_true"); return ap
def main():
    args=parser().parse_args()
    if args.list_sources:
        for name,(filename,kind) in SOURCES.items(): print(f"{name:12} {kind:12} {filename}")
        return 0
    if not args.source: print("ERROR: --source is required unless --list-sources is used.",file=sys.stderr); return 2
    modes=sum(bool(v) for v in (args.section,args.rule,args.keyword))
    if modes!=1: print("ERROR: provide exactly one of --section, --rule, or --keyword.",file=sys.stderr); return 2
    text,kind,path=load(args.source); print("OFFLINE SNAPSHOT - VERIFY AGAINST CURRENT OFFICIAL LAW BEFORE FILING"); print(f"Source: {path.name}\n")
    if args.section:
        if kind=="rule": print("ERROR: use --rule for rules-200.",file=sys.stderr); return 2
        if kind=="constitution": print("ERROR: Constitution sections repeat by article; use --keyword and verify the article.",file=sys.stderr); return 2
        result=find_statute(text,args.section)
        if not result: print(f"Section {args.section} not found in {args.source}."); return 1
        block,position=result; print(f"Nearest PDF page marker: {page_at(text,position)}"); print(block); return 0
    if args.rule:
        if kind!="rule": print("ERROR: --rule is available only for rules-200.",file=sys.stderr); return 2
        result=find_rule(text,args.rule)
        if not result: print(f"Rule {args.rule} not found in {args.source}."); return 1
        block,position=result; print(f"Nearest PDF page marker: {page_at(text,position)}"); print(block); return 0
    hits=keyword_hits(text,args.keyword,args.context,args.max_hits)
    if not hits: print(f"No matches for {args.keyword!r} in {args.source}."); return 1
    for number,(snippet,position) in enumerate(hits,1): print(f"--- match {number}; nearest PDF page marker {page_at(text,position)} ---\n{snippet}\n")
    return 0
if __name__=="__main__": raise SystemExit(main())
