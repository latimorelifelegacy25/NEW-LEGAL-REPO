import re
from dataclasses import dataclass, asdict

LABEL_RE = re.compile(r"^P-(\d+)([A-Z]?)$", re.IGNORECASE)

@dataclass(frozen=True)
class ExhibitRecord:
    label: str
    source_id: str
    confidential: bool
    sealed: bool

def stable_source_id(docket: str, label: str) -> str:
    return f"{docket}:{label.upper()}"

def build_exhibit_index(*, docket: str, labels: list[str], confidential_labels: set[str] | None = None, sealed_labels: set[str] | None = None) -> list[dict]:
    confidential={x.upper() for x in (confidential_labels or set())}
    sealed={x.upper() for x in (sealed_labels or set())}
    seen=set()
    records=[]
    for raw in labels:
        label=raw.upper().strip()
        if not LABEL_RE.match(label) or label in seen:
            continue
        seen.add(label)
        records.append(asdict(ExhibitRecord(
            label=label,
            source_id=stable_source_id(docket,label),
            confidential=label in confidential,
            sealed=label in sealed,
        )))
    return records
