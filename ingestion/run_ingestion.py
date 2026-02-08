"""
Script to run ingestion: read raw corpus and write data/processed/events.json.
Usage:
  python -m ingestion.run_ingestion [--input path/to/emails.csv] [--output data/processed/events.json]
"""
import argparse
import json
from pathlib import Path

from ingestion.parser import CommunicationEvent, load_events_from_csv
from ingestion.enron_parser import load_enron_events


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
    parser.add_argument("--enron", action="store_true", help="Use Enron dataset parser")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of events to process")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"Input not found: {args.input}")
        print("Create data/raw/ and add an Enron-style CSV (columns: sender, recipients, date, subject, body).")
        return

    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # Détecter automatiquement si c'est le format Enron ou utiliser le flag
    is_enron_format = args.enron or "enron" in str(args.input).lower()
    
    if is_enron_format:
        print("Détection du format Enron - utilisation du parser spécialisé")
        events = load_enron_events(args.input, max_events=args.limit)
    else:
        print("Utilisation du parser CSV standard")
        events = load_events_from_csv(args.input)
        if args.limit:
            events = events[:args.limit]
    
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump([event_to_dict(e) for e in events], f, indent=2, ensure_ascii=False)
    print(f"Écrit {len(events)} événements dans {args.output}")


if __name__ == "__main__":
    main()
