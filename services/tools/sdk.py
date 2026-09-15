from abc import ABC, abstractmethod
from typing import Any
class Tool(ABC):
    id: str
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    @abstractmethod
    def execute(self, context: dict[str, Any], arguments: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
