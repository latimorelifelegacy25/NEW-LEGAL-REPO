from dataclasses import dataclass, asdict

@dataclass(frozen=True)
class SourceRecord:
    source_id: str
    docket: str
    label: str
    filename: str
    sha256: str
    source_type: str

class SourceIndex:
    def __init__(self) -> None:
        self._records: dict[str, SourceRecord] = {}
        self._label_to_source: dict[str, str] = {}

    def register(self, record: SourceRecord) -> None:
        self._records[record.source_id] = record
        self._label_to_source[record.label] = record.source_id

    def by_id(self, source_id: str) -> dict | None:
        r=self._records.get(source_id)
        return asdict(r) if r else None

    def by_label(self, label: str) -> dict | None:
        source_id=self._label_to_source.get(label)
        return self.by_id(source_id) if source_id else None

    def label_map(self) -> dict[str,str]:
        return dict(self._label_to_source)
