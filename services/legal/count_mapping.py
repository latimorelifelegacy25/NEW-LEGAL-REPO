from dataclasses import dataclass, asdict

@dataclass(frozen=True)
class CountMap:
    count: str
    title: str
    supporting_paragraphs: list[int]
    status: str

COUNT_TITLES = {
    "I": "Negligence (including recklessness)",
    "II": "Vicarious Liability / Respondeat Superior",
    "III": "Negligent Training / Supervision / Retention",
    "IV": "Intentional or Reckless Interference with Court-Ordered Custodial Rights",
    "V": "Breach of Contract",
}

def build_count_map(mapping: dict[str,list[int]]) -> list[dict]:
    out=[]
    for count,title in COUNT_TITLES.items():
        paragraphs=sorted(set(mapping.get(count, [])))
        out.append(asdict(CountMap(
            count=count,
            title=title,
            supporting_paragraphs=paragraphs,
            status="mapped" if paragraphs else "unmapped",
        )))
    return out
