from __future__ import annotations
import os

class ModelGateway:
    """Capability router only. Provider execution is intentionally adapter-based.

    The gateway never treats a configured API key as permission to transmit a
    legal document. External transmission remains a separately authorized action.
    """
    PROVIDERS = {
        "openai": ("OPENAI_API_KEY", {"text", "reasoning", "structured_output"}),
        "anthropic": ("ANTHROPIC_API_KEY", {"text", "reasoning", "long_context"}),
        "google": ("GOOGLE_AI_API_KEY", {"text", "reasoning", "multimodal"}),
    }

    def configured_providers(self) -> list[str]:
        return [name for name, (env, _) in self.PROVIDERS.items() if os.getenv(env)]

    def route(self, task_type: str, required_capabilities: list[str]) -> dict:
        required = set(required_capabilities)
        for provider, (env, caps) in self.PROVIDERS.items():
            if os.getenv(env) and required.issubset(caps):
                return {"task_type": task_type,"required_capabilities": required_capabilities,"provider": provider,"model": os.getenv(f"LEGALOS_{provider.upper()}_MODEL"),"configured": True,"transmission_authorized": False}
        return {"task_type": task_type,"required_capabilities": required_capabilities,"provider": None,"model": None,"configured": False,"transmission_authorized": False}
