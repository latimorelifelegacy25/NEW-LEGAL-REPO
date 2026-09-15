from services.permissions.gateway import Decision, evaluate
def test_denied_action() -> None:
    assert evaluate(permitted=False, approval_required=False) == Decision.DENY
def test_approval_gate() -> None:
    assert evaluate(permitted=True, approval_required=True) == Decision.REQUIRE_APPROVAL
