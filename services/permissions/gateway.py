from enum import StrEnum
class Decision(StrEnum):
    ALLOW = "allow"
    DENY = "deny"
    REQUIRE_APPROVAL = "require_approval"
def evaluate(*, permitted: bool, approval_required: bool) -> Decision:
    if not permitted: return Decision.DENY
    if approval_required: return Decision.REQUIRE_APPROVAL
    return Decision.ALLOW
