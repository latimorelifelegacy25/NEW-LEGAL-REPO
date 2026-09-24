from services.registry import get_skill, list_skills, verify_catalog

def test_integrated_skill_catalog_is_complete():
    skills = list_skills()
    assert len(skills) == 21
    assert get_skill("pa-litigation-command") is not None
    assert get_skill("litigation-operations.chronology") is not None
    assert get_skill("governance.skills-qa") is not None
    result = verify_catalog()
    assert result["status"] == "pass"
    assert result["hash_mismatches"] == []
