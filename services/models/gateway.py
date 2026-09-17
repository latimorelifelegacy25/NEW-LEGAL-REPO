class ModelGateway:
    def route(self, task_type: str, required_capabilities: list[str]) -> dict:
        return {"task_type": task_type, "required_capabilities": required_capabilities, "provider": None, "model": None}
