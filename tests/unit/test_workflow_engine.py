from services.workflow import prepare_run

def test_workflow_requires_matter_when_needed(tmp_path, monkeypatch):
    monkeypatch.setenv("LEGALOS_STATE_PATH", str(tmp_path / "state.json"))
    run = prepare_run("pa-filing-readiness", {})
    assert run["status"] == "waiting_for_input"
    assert "matter_id" in run["missing"]

def test_workflow_prepares_with_known_matter(tmp_path, monkeypatch):
    monkeypatch.setenv("LEGALOS_STATE_PATH", str(tmp_path / "state.json"))
    run = prepare_run("pa-filing-readiness", {"matter_id":"S-1214-2026"})
    assert run["status"] == "prepared"
    assert run["legal_task_status"] == "not_executed"
    assert any(step.get("skill") == "pa-litigation-command" for step in run["steps"])
