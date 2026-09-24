from services.knowledge import build_index

def run() -> None:
    result = build_index()
    print(f"knowledge index built: {result['documents']} documents -> {result['path']}")

if __name__ == "__main__":
    run()
