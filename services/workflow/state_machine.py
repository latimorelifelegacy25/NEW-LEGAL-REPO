VALID_TRANSITIONS = {
    "queued": {"running", "cancelled"},
    "running": {"waiting_for_input", "waiting_for_approval", "completed", "failed", "cancelled", "quarantined"},
    "waiting_for_input": {"running", "cancelled"},
    "waiting_for_approval": {"running", "cancelled"},
    "failed": {"running", "cancelled"},
}
def can_transition(current: str, target: str) -> bool:
    return target in VALID_TRANSITIONS.get(current, set())
