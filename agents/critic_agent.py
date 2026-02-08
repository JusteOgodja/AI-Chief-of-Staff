"""Critic Agent: detects conflicts, contradictions, and information overload."""
from __future__ import annotations

from typing import Any

from truth import SourceOfTruth


class CriticAgent:
    """Critic Agent: detects conflicts, contradictions, and overload issues."""
    
    def __init__(self, truth: SourceOfTruth):
        self.truth = truth
    
    def detect_conflicts(self, hours: int = 24) -> dict[str, Any]:
        """Detect conflicting information in recent changes."""
        recent_changes = self.truth.get_recent_changes(hours)
        
        conflicts = []
        
        # Check for contradictory decisions
        decisions = [c for c in recent_changes if c.entity_type == "decision"]
        conflicts.extend(self._find_contradictory_decisions(decisions))
        
        # Check for topic conflicts
        topics = [c for c in recent_changes if c.entity_type == "topic"]
        conflicts.extend(self._find_contradictory_topics(topics))
        
        return {
            "answer": f"Conflicts detected in last {hours} hours:",
            "conflicts_found": len(conflicts),
            "conflicts": conflicts[:5],  # Top 5 conflicts
            "reasoning": f"Analyzed {len(recent_changes)} recent entries, found {len(conflicts)} potential conflicts"
        }
    
    def detect_overload(self, person_id: str, hours: int = 24) -> dict[str, Any]:
        """Detect if a person is experiencing information overload."""
        recent_changes = self.truth.get_recent_changes(hours)
        
        # Count changes relevant to this person
        relevant_changes = []
        for change in recent_changes:
            if person_id.lower() in change.content.lower() or person_id.lower() in change.source_event_id.lower():
                relevant_changes.append(change)
        
        # Check overload thresholds
        overload_threshold = 10  # More than 10 relevant changes per day
        is_overloaded = len(relevant_changes) > overload_threshold
        
        # Categorize by type
        decisions = [c for c in relevant_changes if c.entity_type == "decision"]
        topics = [c for c in relevant_changes if c.entity_type == "topic"]
        
        return {
            "answer": f"Information overload analysis for {person_id}:",
            "is_overloaded": is_overloaded,
            "relevant_changes": len(relevant_changes),
            "breakdown": {
                "decisions": len(decisions),
                "topics": len(topics),
                "other": len(relevant_changes) - len(decisions) - len(topics)
            },
            "threshold": overload_threshold,
            "recommendation": "Consider filtering or prioritizing information" if is_overloaded else "Information load is manageable",
            "reasoning": f"Checked {len(recent_changes)} recent changes against {person_id}'s information context"
        }
    
    def detect_knowledge_gaps(self, topic: str = "") -> dict[str, Any]:
        """Detect knowledge gaps in the organization."""
        all_entries = list(self.truth.entries.values())
        
        if topic:
            # Look for gaps in specific topic
            topic_entries = [e for e in all_entries if topic.lower() in e.content.lower()]
            
            # Check if there are decisions but no implementation details
            decisions = [e for e in topic_entries if e.entity_type == "decision"]
            facts = [e for e in topic_entries if e.entity_type == "fact"]
            
            gaps = []
            if decisions and not facts:
                gaps.append(f"Decisions exist about '{topic}' but no implementation facts")
            
            return {
                "answer": f"Knowledge gaps for '{topic}':",
                "gaps": gaps,
                "topic_coverage": len(topic_entries),
                "reasoning": f"Analyzed {len(topic_entries)} entries related to '{topic}'"
            }
        else:
            # General gap analysis
            decisions = [e for e in all_entries if e.entity_type == "decision"]
            facts = [e for e in all_entries if e.entity_type == "fact"]
            
            # Look for decisions without corresponding facts
            gap_areas = []
            for decision in decisions[-10:]:  # Check last 10 decisions
                has_facts = any(
                    fact.source_event_id == decision.source_event_id or
                    decision.content.lower() in fact.content.lower()
                    for fact in facts
                )
                if not has_facts:
                    gap_areas.append(decision.content[:100])
            
            return {
                "answer": "General knowledge gaps:",
                "gaps": gap_areas[:5],
                "total_decisions": len(decisions),
                "total_facts": len(facts),
                "reasoning": f"Analyzed {len(all_entries)} truth entries for decision-implementation gaps"
            }
    
    def _find_contradictory_decisions(self, decisions: list) -> list[dict[str, Any]]:
        """Find contradictory decisions using simple keyword matching."""
        contradictions = []
        
        # Simple contradiction patterns
        contradiction_pairs = [
            ("proceed", "cancel", "proceed vs cancel"),
            ("approve", "reject", "approve vs reject"),
            ("increase", "decrease", "increase vs decrease"),
            ("start", "stop", "start vs stop"),
        ]
        
        for i, decision1 in enumerate(decisions):
            for decision2 in decisions[i+1:]:
                for word1, word2, conflict_type in contradiction_pairs:
                    if (word1 in decision1.content.lower() and word2 in decision2.content.lower()) or \
                       (word2 in decision1.content.lower() and word1 in decision2.content.lower()):
                        contradictions.append({
                            "type": "decision_contradiction",
                            "conflict_type": conflict_type,
                            "decision1": decision1.content[:100],
                            "decision2": decision2.content[:100],
                            "times": [decision1.timestamp, decision2.timestamp]
                        })
        
        return contradictions
    
    def _find_contradictory_topics(self, topics: list) -> list[dict[str, Any]]:
        """Find contradictory topic statements."""
        contradictions = []
        
        # Look for topics with opposite sentiments
        positive_words = ["success", "achieved", "completed", "good", "excellent"]
        negative_words = ["failure", "delayed", "cancelled", "bad", "problem"]
        
        for i, topic1 in enumerate(topics):
            for topic2 in topics[i+1:]:
                # Check if topics are similar but have opposite sentiment
                if self._topics_similar(topic1.content, topic2.content):
                    pos1 = any(word in topic1.content.lower() for word in positive_words)
                    neg1 = any(word in topic1.content.lower() for word in negative_words)
                    pos2 = any(word in topic2.content.lower() for word in positive_words)
                    neg2 = any(word in topic2.content.lower() for word in negative_words)
                    
                    if (pos1 and neg2) or (neg1 and pos2):
                        contradictions.append({
                            "type": "topic_contradiction",
                            "topic1": topic1.content[:100],
                            "topic2": topic2.content[:100],
                            "times": [topic1.timestamp, topic2.timestamp]
                        })
        
        return contradictions
    
    def _topics_similar(self, topic1: str, topic2: str) -> bool:
        """Simple similarity check for topics."""
        words1 = set(topic1.lower().split())
        words2 = set(topic2.lower().split())
        
        # If they share more than 2 significant words, consider them similar
        significant_words1 = {w for w in words1 if len(w) > 3}
        significant_words2 = {w for w in words2 if len(w) > 3}
        
        intersection = significant_words1.intersection(significant_words2)
        return len(intersection) >= 2
