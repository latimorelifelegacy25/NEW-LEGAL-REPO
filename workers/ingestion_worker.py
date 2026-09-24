from services.storage import get_store

def run() -> None:
    imports = get_store().list("imports")
    validated = sum(1 for item in imports if item.get("status") == "validated")
    quarantined = sum(1 for item in imports if item.get("status") == "quarantined")
    print(f"imports: total={len(imports)} validated={validated} quarantined={quarantined}")

if __name__ == "__main__":
    run()
