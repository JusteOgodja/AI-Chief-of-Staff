"""
Script to run ingestion: read raw corpus and write data/processed/events.json.
Usage:
  python -m ingestion.run_ingestion [--input path/to/emails.csv] [--output data/processed/events.json]
"""
import argparse
import json
from pathlib import Path

from ingestion.parser import CommunicationEvent, load_events_from_csv


def event_to_dict(e: CommunicationEvent) -> dict:
    return {
        "event_id": e.event_id,
        "sender_id": e.sender_id,
        "receiver_id": e.receiver_id,
        "timestamp": e.timestamp.isoformat(),
        "subject": e.subject,
        "body": e.body,
        "thread_id": e.thread_id,
        "source": e.source,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest communication corpus to events.json")
    parser.add_argument("--input", type=Path, default=Path("data/raw/emails.csv"), help="Input CSV path")
    parser.add_argument("--output", type=Path, default=Path("data/processed/events.json"), help="Output JSON path")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"Input not found: {args.input}")
        print("Create data/raw/ and add an Enron-style CSV (columns: sender, recipients, date, subject, body).")
        return

    args.output.parent.mkdir(parents=True, exist_ok=True)
    events = load_events_from_csv(args.input)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump([event_to_dict(e) for e in events], f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(events)} events to {args.output}")


if __name__ == "__main__":
    main()
