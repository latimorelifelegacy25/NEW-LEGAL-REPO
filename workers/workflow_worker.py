from services.workflow import list_runs

def run() -> None:
    runs = list_runs()
    waiting = sum(1 for run in runs if run.get("status") == "waiting_for_input")
    prepared = sum(1 for run in runs if run.get("status") == "prepared")
    print(f"workflow runs: total={len(runs)} prepared={prepared} waiting_for_input={waiting}")

if __name__ == "__main__":
    run()
