"""
Generate a small mock email dataset for development and demo when Enron is not available.
Output: data/raw/emails.csv
"""
import csv
from datetime import datetime, timedelta
from pathlib import Path

PEOPLE = [
    "alice@company.com",
    "bob@company.com",
    "carol@company.com",
    "dave@company.com",
    "eve@company.com",
    "frank@company.com",
]
SUBJECTS = [
    "Q4 budget approval",
    "Product launch timeline",
    "Hiring plan engineering",
    "Security review",
    "OKRs next quarter",
    "Meeting tomorrow",
]
BODIES = [
    "Can we align on the numbers by Friday?",
    "Let's push to March 15.",
    "We need 2 more backend engineers.",
    "All services passed. Proceeding with deploy.",
    "I'll send the draft by EOD.",
    "Same time tomorrow works.",
]


def generate_mock_emails(n: int = 80, seed: int = 42) -> list[dict]:
    import random
    random.seed(seed)
    events = []
    base = datetime(2025, 1, 1)
    for i in range(n):
        sender = random.choice(PEOPLE)
        others = [p for p in PEOPLE if p != sender]
        recv = random.choice(others)
        dt = base + timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        events.append({
            "message_id": f"msg_{i}",
            "sender": sender,
            "recipients": recv,
            "date": dt.isoformat(),
            "subject": random.choice(SUBJECTS),
            "body": random.choice(BODIES),
        })
    return events


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    out = project_root / "data" / "raw" / "emails.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    rows = generate_mock_emails()
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["message_id", "sender", "recipients", "date", "subject", "body"])
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} mock emails to {out}")


if __name__ == "__main__":
    main()
