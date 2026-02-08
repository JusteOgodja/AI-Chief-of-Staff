"""Populate source of truth with extracted data from events."""
import json
from pathlib import Path
from datetime import datetime

from truth import SourceOfTruth, TruthEntry


def populate_truth_from_events(events_path: Path, truth_path: Path) -> None:
    """Populate source of truth with topics and decisions from enriched events."""
    if not events_path.exists():
        print(f"Events file not found: {events_path}")
        return
    
    truth = SourceOfTruth(truth_path)
    
    with open(events_path, encoding="utf-8") as f:
        events = json.load(f)
    
    print(f"Processing {len(events)} events for truth population...")
    
    added_count = 0
    for event in events:
        event_id = event.get("event_id", "")
        timestamp = event.get("timestamp", datetime.now().isoformat())
        
        # Add topics
        for topic in event.get("topics", []):
            entry = TruthEntry(
                id=f"topic_{hash(topic)}_{event_id}",
                content=topic,
                entity_type="topic",
                timestamp=timestamp,
                source_event_id=event_id,
                confidence=0.7
            )
            truth.add_or_update(entry)
            added_count += 1
        
        # Add decisions
        for decision in event.get("decisions", []):
            entry = TruthEntry(
                id=f"decision_{hash(decision)}_{event_id}",
                content=decision,
                entity_type="decision",
                timestamp=timestamp,
                source_event_id=event_id,
                confidence=0.8
            )
            truth.add_or_update(entry)
            added_count += 1
        
        # Add key facts (entities as facts)
        for entity in event.get("entities_mentioned", []):
            if "@" in entity:  # Email address - treat as fact about person involvement
                entry = TruthEntry(
                    id=f"fact_{entity}_{event_id}",
                    content=f"{entity} involved in communication",
                    entity_type="fact",
                    timestamp=timestamp,
                    source_event_id=event_id,
                    confidence=0.9
                )
                truth.add_or_update(entry)
                added_count += 1
    
    print(f"Added {added_count} truth entries")
    print(f"Truth store now contains {len(truth.entries)} entries")


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    events_path = project_root / "data" / "processed" / "events_enriched.json"
    truth_path = project_root / "data" / "processed" / "truth.json"
    
    populate_truth_from_events(events_path, truth_path)


if __name__ == "__main__":
    main()
