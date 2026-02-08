"""Coordinator Agent: decides who needs to know what and routes information."""
from __future__ import annotations

from typing import Any

import networkx as nx

from agents.memory_agent import MemoryAgent


class CoordinatorAgent:
    """Coordinator Agent: routes information and decides who needs to know what."""
    
    def __init__(self, graph: nx.DiGraph, memory: MemoryAgent):
        self.graph = graph
        self.memory = memory
    
    def who_needs_to_know(self, content: str, content_type: str = "general") -> dict[str, Any]:
        """Answer: Who needs to know this?"""
        # Extract people mentioned in content
        mentioned_people = self._extract_people_from_content(content)
        
        # Find relevant stakeholders based on graph topology
        relevant_stakeholders = self._find_relevant_stakeholders(content, mentioned_people)
        
        # Prioritize by communication patterns
        prioritized = self._prioritize_by_centrality(relevant_stakeholders)
        
        return {
            "answer": f"People who need to know about this {content_type}:",
            "mentioned_people": mentioned_people,
            "recommended_notifications": prioritized[:10],  # Top 10
            "reasoning": f"Analyzed {len(self.graph.nodes())} people in communication graph, found {len(relevant_stakeholders)} relevant stakeholders based on content and network topology"
        }
    
    def _extract_people_from_content(self, content: str) -> list[str]:
        """Extract people mentioned in content."""
        mentioned = []
        content_lower = content.lower()
        
        # Check if any node IDs (emails) are mentioned
        for node in self.graph.nodes():
            if node.lower() in content_lower:
                mentioned.append(node)
        
        return mentioned
    
    def _find_relevant_stakeholders(self, content: str, mentioned: list[str]) -> list[str]:
        """Find stakeholders relevant to content based on graph connections."""
        relevant = set(mentioned)
        
        # Add direct connections to mentioned people
        for person in mentioned:
            if person in self.graph:
                # Add people who communicate with mentioned person
                relevant.update(self.graph.predecessors(person))
                relevant.update(self.graph.successors(person))
        
        # Add highly connected people (potential information hubs)
        centrality = nx.degree_centrality(self.graph)
        high_centrality = [n for n, c in centrality.items() if c > 0.1]  # Top 10% by degree
        
        # Add some high-centrality nodes if not already included
        for hub in high_centrality[:5]:
            if len(relevant) < 20:  # Limit scope
                relevant.add(hub)
        
        return list(relevant)
    
    def _prioritize_by_centrality(self, stakeholders: list[str]) -> list[dict[str, Any]]:
        """Prioritize stakeholders by network centrality metrics."""
        if not stakeholders:
            return []
        
        # Calculate centrality metrics
        degree_centrality = nx.degree_centrality(self.graph)
        betweenness_centrality = nx.betweenness_centrality(self.graph)
        
        prioritized = []
        for person in stakeholders:
            if person in self.graph:
                prioritized.append({
                    "person": person,
                    "degree_centrality": degree_centrality.get(person, 0),
                    "betweenness_centrality": betweenness_centrality.get(person, 0),
                    "communication_volume": self.graph.degree(person, weight="weight")
                })
        
        # Sort by combined centrality score
        prioritized.sort(
            key=lambda x: (x["degree_centrality"] * 0.4 + 
                          x["betweenness_centrality"] * 0.4 + 
                          min(x["communication_volume"] / 100, 1) * 0.2),
            reverse=True
        )
        
        return prioritized
    
    def suggest_amplification(self, content: str, reach_level: str = "medium") -> dict[str, Any]:
        """Suggest how to amplify information based on reach level."""
        relevant = self._find_relevant_stakeholders(content, [])
        
        if reach_level == "low":
            # Only direct stakeholders
            target = relevant[:5]
        elif reach_level == "medium":
            # Stakeholders + their direct connections
            target = relevant[:15]
        else:  # high
            # Broader organization
            target = relevant[:50]
        
        return {
            "answer": f"Amplification strategy for {reach_level} reach:",
            "target_audience_size": len(target),
            "recommended_channels": ["email", "team meeting", "dashboard update"],
            "target_people": target[:10],  # Show top 10
            "reasoning": f"Selected {len(target)} people based on communication patterns and content relevance"
        }
