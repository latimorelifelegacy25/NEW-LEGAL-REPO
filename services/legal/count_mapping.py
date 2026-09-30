from dataclasses import dataclass, asdict
import re

COUNT_RE = re.compile(r"^COUNT\s+([IVXLCDM]+)\s*[—-]\s*(.+)$", re.IGNORECASE)

@dataclass(frozen=True)
class CountMap:
    count: str
    title: str
    start_paragraph: int | None
    mapped_paragraphs: list[int]

def derive_count_map(headings: list[dict], paragraph_numbers: list[int], explicit_mapping: dict[str, list[int]] | None = None) -> list[dict]:
    """Derive counts from the loaded operative pleading; never assume a fixed count total."""
    explicit_mapping = explicit_mapping or {}
    parsed=[]
    for item in headings:
        match=COUNT_RE.match(str(item.get("text","")).strip())
        if not match:
            continue
        start=item.get("start_paragraph")
        parsed.append((match.group(1).upper(), match.group(2).strip(), int(start) if start is not None else None))

    out=[]
    for roman,title,start in parsed:
        mapped=list(explicit_mapping.get(roman, []))
        if not mapped and start is not None:
            later=[s for _,_,s in parsed if s is not None and s > start]
            end=(min(later)-1) if later else (max(paragraph_numbers) if paragraph_numbers else start)
            mapped=[n for n in paragraph_numbers if start <= n <= end]
        out.append(asdict(CountMap(roman,title,start,mapped)))
    return out

def build_count_map(mapping: dict[str, list[int]], headings: list[dict] | None = None, paragraph_numbers: list[int] | None = None) -> list[dict]:
    if headings is not None:
        return derive_count_map(headings, paragraph_numbers or [], mapping)
    return [asdict(CountMap(str(k), f"Count {k}", None, list(v))) for k,v in mapping.items()]
