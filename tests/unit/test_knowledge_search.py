from services.knowledge import search

def test_search_finds_pa_rule_discipline():
    result = search("Rule 4014")
    assert result["results"]
    assert any("pa-litigation-command" in item["path"] for item in result["results"])
