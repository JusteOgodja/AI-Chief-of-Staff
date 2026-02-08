"""
Enrich events with topics, decisions, entities using the configured LLM (Ollama by default).
Usage: python -m extraction.run_enrich [--limit N]
Reads data/processed/events.json, writes data/processed/events_enriched.json.
"""
import argparse
import json
import sys
from pathlib import Path

# Project root
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from config import get_settings
from extraction.extractor import get_extractor_from_settings


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich events with Ollama (or heuristic/OpenAI)")
    parser.add_argument("--limit", type=int, default=0, help="Max events to enrich (0 = all)")
    parser.add_argument("--input", type=Path, default=ROOT / "data" / "processed" / "events.json")
    parser.add_argument("--output", type=Path, default=ROOT / "data" / "processed" / "events_enriched.json")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"Input not found: {args.input}. Run ingestion first.")
        return

    settings = get_settings()
    extract_fn, provider_name = get_extractor_from_settings(settings)
    print(f"Using extractor: {provider_name}")

    with open(args.input, encoding="utf-8") as f:
        events = json.load(f)
    if args.limit and args.limit > 0:
        events = events[: args.limit]
        print(f"Enriching first {len(events)} events...")
    else:
        print(f"Enriching {len(events)} events...")

    enriched = []
    for i, ev in enumerate(events):
        if (i + 1) % 10 == 0 or i == 0:
            print(f"  {i + 1}/{len(events)}")
        info = extract_fn(
            ev.get("subject", ""),
            ev.get("body", ""),
            ev.get("sender_id", ""),
            ev.get("receiver_id", ""),
        )
        enriched.append({
            **ev,
            "topics": info.topics,
            "decisions": info.decisions,
            "entities_mentioned": info.entities_mentioned,
            "summary": info.summary,
        })

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(enriched)} enriched events to {args.output}")


if __name__ == "__main__":
    main()
