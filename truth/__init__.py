"""Truth module: versioned source of truth for organizational knowledge."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from graph.schema import Decision


@dataclass
class TruthEntry:
    """A single entry in the source of truth."""
    id: str
    content: str
    entity_type: str  # "decision", "topic", "fact"
    timestamp: str
    source_event_id: str
    version: int = 1
    previous_version_id: str | None = None
    confidence: float = 1.0
    metadata: dict[str, Any] = field(default_factory=dict)


class SourceOfTruth:
    """Versioned source of truth for organizational knowledge."""
    
    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
        self.entries: dict[str, TruthEntry] = {}
        self.load()
    
    def load(self) -> None:
        """Load truth entries from storage."""
        if self.storage_path.exists():
            try:
                data = json.loads(self.storage_path.read_text(encoding="utf-8"))
                for entry_id, entry_data in data.items():
                    self.entries[entry_id] = TruthEntry(**entry_data)
            except Exception as e:
                print(f"Error loading truth: {e}")
    
    def save(self) -> None:
        """Save truth entries to storage."""
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            entry_id: {
                "id": entry.id,
                "content": entry.content,
                "entity_type": entry.entity_type,
                "timestamp": entry.timestamp,
                "source_event_id": entry.source_event_id,
                "version": entry.version,
                "previous_version_id": entry.previous_version_id,
                "confidence": entry.confidence,
                "metadata": entry.metadata,
            }
            for entry_id, entry in self.entries.items()
        }
        self.storage_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    
    def add_or_update(self, entry: TruthEntry) -> TruthEntry:
        """Add a new entry or update existing one (creates new version)."""
        existing = self.entries.get(entry.id)
        if existing:
            # Create new version
            entry.version = existing.version + 1
            entry.previous_version_id = existing.id
            entry.id = f"{entry.id}_v{entry.version}"
        
        self.entries[entry.id] = entry
        self.save()
        return entry
    
    def get_current_truth(self, entity_id: str) -> TruthEntry | None:
        """Get the current version of a truth entity."""
        # Find the latest version
        latest = None
        for entry in self.entries.values():
            if entry.id.startswith(entity_id) and entry.entity_type not in ["decision", "topic", "fact"]:
                continue
            if (entry.id == entity_id or entry.id.startswith(f"{entity_id}_v")):
                if latest is None or entry.version > latest.version:
                    latest = entry
        return latest
    
    def get_recent_changes(self, hours: int = 24) -> list[TruthEntry]:
        """Get recent changes within specified hours."""
        cutoff = datetime.now().timestamp() - (hours * 3600)
        recent = []
        for entry in self.entries.values():
            try:
                entry_time = datetime.fromisoformat(entry.timestamp.replace("Z", "+00:00")).timestamp()
                if entry_time > cutoff:
                    recent.append(entry)
            except Exception:
                continue
        return sorted(recent, key=lambda x: x.timestamp, reverse=True)
    
    def search_truth(self, query: str, limit: int = 10) -> list[TruthEntry]:
        """Search truth entries by content."""
        query_lower = query.lower()
        matches = []
        for entry in self.entries.values():
            if query_lower in entry.content.lower():
                matches.append(entry)
        return sorted(matches, key=lambda x: x.timestamp, reverse=True)[:limit]
    
    def get_all_by_type(self, entity_type: str) -> list[TruthEntry]:
        """Get all entries of a specific type."""
        return [e for e in self.entries.values() if e.entity_type == entity_type]
