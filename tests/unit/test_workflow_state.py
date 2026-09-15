from services.workflow.state_machine import can_transition
def test_queued_can_run() -> None:
    assert can_transition("queued", "running")
