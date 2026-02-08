"""Memory Agent: answers questions about current truth and recent changes."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from truth import SourceOfTruth, TruthEntry


class MemoryAgent:
    """Memory Agent: maintains organizational memory and answers truth questions."""
    
    def __init__(self, truth: SourceOfTruth):
        self.truth = truth
    
    def what_is_current_truth(self, query: str = "") -> dict[str, Any]:
        """Answer: What is the current truth?"""
        if query:
            # Search for specific topic
            results = self.truth.search_truth(query, limit=5)
            if results:
                return {
                    "answer": f"Current truth about '{query}':",
                    "results": [
                        {
                            "content": r.content,
                            "timestamp": r.timestamp,
                            "source": r.source_event_id,
                            "confidence": r.confidence
                        }
                        for r in results
                    ],
                    "reasoning": f"Searched {len(self.truth.entries)} truth entries, found {len(results)} matches"
                }
            else:
                return {
                    "answer": f"No current truth found for '{query}'",
                    "results": [],
                    "reasoning": f"Searched {len(self.truth.entries)} truth entries, no matches found"
                }
        else:
            # Get all current truth by type
            decisions = self.truth.get_all_by_type("decision")
            topics = self.truth.get_all_by_type("topic")
            
            return {
                "answer": "Current organizational truth:",
                "decisions": [
                    {
                        "content": d.content,
                        "timestamp": d.timestamp,
                        "version": d.version
                    }
                    for d in decisions[-5:]  # Last 5 decisions
                ],
                "topics": [
                    {
                        "content": t.content,
                        "timestamp": t.timestamp,
                        "version": t.version
                    }
                    for t in topics[-5:]  # Last 5 topics
                ],
                "reasoning": f"Retrieved {len(decisions)} decisions and {len(topics)} topics from truth store"
            }
    
    def what_changed_today(self, hours: int = 24) -> dict[str, Any]:
        """Answer: What changed today?"""
        changes = self.truth.get_recent_changes(hours)
        
        # Group by type
        decisions = [c for c in changes if c.entity_type == "decision"]
        topics = [c for c in changes if c.entity_type == "topic"]
        facts = [c for c in changes if c.entity_type == "fact"]
        
        return {
            "answer": f"Changes in the last {hours} hours:",
            "summary": {
                "total_changes": len(changes),
                "new_decisions": len(decisions),
                "new_topics": len(topics),
                "new_facts": len(facts)
            },
            "changes": [
                {
                    "type": c.entity_type,
                    "content": c.content,
                    "timestamp": c.timestamp,
                    "source": c.source_event_id,
                    "version": c.version
                }
                for c in changes[:10]  # Limit to 10 most recent
            ],
            "reasoning": f"Scanned {len(self.truth.entries)} truth entries, found {len(changes)} recent changes"
        }
    
    def get_context_for_person(self, person_id: str) -> dict[str, Any]:
        """Get context view for a stakeholder."""
        # Search for truth entries involving this person
        relevant_entries = []
        for entry in self.truth.entries.values():
            if person_id.lower() in entry.content.lower() or person_id.lower() in entry.source_event_id.lower():
                relevant_entries.append(entry)
        
        # Get recent changes that might affect this person
        recent_changes = self.truth.get_recent_changes(48)  # Last 2 days
        
        return {
            "answer": f"Context for {person_id}:",
            "relevant_truth": [
                {
                    "content": e.content,
                    "type": e.entity_type,
                    "timestamp": e.timestamp
                }
                for e in relevant_entries[:5]
            ],
            "recent_changes": [
                {
                    "content": c.content,
                    "type": c.entity_type,
                    "timestamp": c.timestamp
                }
                for c in recent_changes[:5] if person_id.lower() in c.content.lower()
            ],
            "reasoning": f"Found {len(relevant_entries)} relevant entries and {len(recent_changes)} recent changes"
        }
