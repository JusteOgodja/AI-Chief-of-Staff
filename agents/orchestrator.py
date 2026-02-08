"""Orchestrator: coordinates between agents and handles user queries."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import networkx as nx

from agents import MemoryAgent, CoordinatorAgent, CriticAgent
from truth import SourceOfTruth, TruthEntry


class AgentOrchestrator:
    """Main orchestrator for the AI Chief of Staff agents."""
    
    def __init__(self, graph_path: Path, truth_path: Path):
        # Load knowledge graph
        self.graph = nx.DiGraph()
        if graph_path.exists():
            from graph.builder import load_graph_from_json
            self.graph = load_graph_from_json(graph_path)
        
        # Initialize source of truth
        self.truth = SourceOfTruth(truth_path)
        
        # Initialize agents
        self.memory_agent = MemoryAgent(self.truth)
        self.coordinator_agent = CoordinatorAgent(self.graph, self.memory_agent)
        self.critic_agent = CriticAgent(self.truth)
    
    def process_query(self, query: str) -> dict[str, Any]:
        """Process a user query and route to appropriate agent(s)."""
        query_lower = query.lower()
        
        # Route to appropriate agent based on query intent
        if "what changed" in query_lower or "what is the current truth" in query_lower:
            if "what changed" in query_lower:
                response = self.memory_agent.what_changed_today()
            else:
                response = self.memory_agent.what_is_current_truth()
            
            # Normalize response structure
            if "decisions" in response or "topics" in response:
                normalized_response = {
                    "answer": response["answer"],
                    "results": [],
                    "changes": response.get("changes", []),
                    "recommended_notifications": [],
                    "reasoning": response.get("reasoning", "")
                }
                
                # Add decisions to results
                for decision in response.get("decisions", []):
                    normalized_response["results"].append({
                        "type": "decision",
                        "content": decision["content"],
                        "timestamp": decision["timestamp"],
                        "version": decision.get("version", 1)
                    })
                
                # Add topics to results
                for topic in response.get("topics", []):
                    normalized_response["results"].append({
                        "type": "topic", 
                        "content": topic["content"],
                        "timestamp": topic["timestamp"],
                        "version": topic.get("version", 1)
                    })
                
                response = normalized_response
        
        elif "who needs to know" in query_lower:
            # Extract the content after "who needs to know"
            content = query.replace("who needs to know", "").replace("?", "").strip()
            response = self.coordinator_agent.who_needs_to_know(content)
        
        elif "context for" in query_lower:
            # Extract person name from query
            words = query.split()
            person_idx = words.index("for") + 1 if "for" in words else -1
            person = words[person_idx] if person_idx < len(words) else ""
            response = self.memory_agent.get_context_for_person(person)
            
            # Normalize response structure
            if "relevant_truth" in response:
                normalized_response = {
                    "answer": response["answer"],
                    "results": response.get("relevant_truth", []),
                    "changes": response.get("recent_changes", []),
                    "recommended_notifications": [],
                    "reasoning": response.get("reasoning", "")
                }
                response = normalized_response
        
        elif "conflict" in query_lower or "contradiction" in query_lower:
            response = self.critic_agent.detect_conflicts()
        
        elif "overload" in query_lower:
            # Extract person name
            words = query.split()
            person = next((w for w in words if "@" in w), "unknown")
            response = self.critic_agent.detect_overload(person)
        
        elif "gap" in query_lower:
            # Extract topic if specified
            topic = query.replace("knowledge gap", "").replace("gaps", "").strip()
            response = self.critic_agent.detect_knowledge_gaps(topic if topic else "")
        
        else:
            # General query - try to determine intent
            response = self._handle_general_query(query)
        
        # Add metadata about the orchestration
        response["orchestration"] = {
            "query": query,
            "agent_used": self._get_agent_name(query),
            "graph_nodes": len(self.graph.nodes()),
            "graph_edges": len(self.graph.edges()),
            "truth_entries": len(self.truth.entries)
        }
        
        return response
    
    def _handle_general_query(self, query: str) -> dict[str, Any]:
        """Handle general queries with best-effort routing."""
        query_lower = query.lower()
        
        if "decision" in query_lower or "truth" in query_lower:
            return self.memory_agent.what_is_current_truth(query)
        elif "notify" in query_lower or "tell" in query_lower:
            return self.coordinator_agent.who_needs_to_know(query)
        elif "problem" in query_lower or "issue" in query_lower:
            return self.critic_agent.detect_conflicts()
        else:
            return {
                "answer": "I can help with: 'what changed today?', 'what is the current truth?', 'who needs to know [X]?', 'context for [person]', 'conflicts', 'overload [person]', or 'knowledge gaps [topic]'",
                "suggestion": "Please rephrase your query using one of these patterns",
                "reasoning": "Query intent unclear, providing guidance"
            }
    
    def _get_agent_name(self, query: str) -> str:
        """Determine which agent handled the query."""
        query_lower = query.lower()
        
        if any(phrase in query_lower for phrase in ["what changed", "current truth", "context for"]):
            return "Memory Agent"
        elif "who needs to know" in query_lower:
            return "Coordinator Agent"
        elif any(phrase in query_lower for phrase in ["conflict", "overload", "gap"]):
            return "Critic Agent"
        else:
            return "General"
    
    def simulate_event_update(self, event_data: dict[str, Any]) -> dict[str, Any]:
        """Simulate processing a new event and updating knowledge."""
        # Extract information from the event
        content = f"{event_data.get('subject', '')} {event_data.get('body', '')}"
        
        # Create truth entries for decisions and topics
        entries_created = []
        
        # Add decision if detected
        decisions = event_data.get("decisions", [])
        for decision in decisions:
            entry = TruthEntry(
                id=f"decision_{hash(decision)}",
                content=decision,
                entity_type="decision",
                timestamp=event_data.get("timestamp", ""),
                source_event_id=event_data.get("event_id", ""),
                confidence=0.8
            )
            self.truth.add_or_update(entry)
            entries_created.append(entry.id)
        
        # Add topics if detected
        topics = event_data.get("topics", [])
        for topic in topics:
            entry = TruthEntry(
                id=f"topic_{hash(topic)}",
                content=topic,
                entity_type="topic",
                timestamp=event_data.get("timestamp", ""),
                source_event_id=event_data.get("event_id", ""),
                confidence=0.7
            )
            self.truth.add_or_update(entry)
            entries_created.append(entry.id)
        
        # Get recommendations from coordinator
        recommendations = self.coordinator_agent.who_needs_to_know(content)
        
        # Check for conflicts
        conflicts = self.critic_agent.detect_conflicts()
        
        return {
            "answer": "Event processed and knowledge updated:",
            "entries_created": entries_created,
            "recommendations": recommendations.get("recommended_notifications", [])[:5],
            "conflicts_detected": conflicts.get("conflicts_found", 0),
            "reasoning": f"Processed event with {len(decisions)} decisions and {len(topics)} topics"
        }
