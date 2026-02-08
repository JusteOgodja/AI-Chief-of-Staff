"""
Build Knowledge Graph + Stakeholder Map from communication events.
Uses NetworkX; can export to JSON for persistence and frontend viz.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import networkx as nx

from graph.schema import (
    EDGE_COMMUNICATES,
    EDGE_DECIDED_ON,
    EDGE_MENTIONS_TOPIC,
    NODE_TYPE_DECISION,
    NODE_TYPE_PERSON,
    NODE_TYPE_TOPIC,
)


def build_knowledge_graph(events: list[dict[str, Any]]) -> nx.DiGraph:
    """
    Build a complete knowledge graph including people, topics, and decisions.
    Input: enriched events with topics, decisions, entities.
    """
    G = nx.DiGraph()
    
    # Track communication patterns
    pair_counts: dict[tuple[str, str], int] = {}
    
    # Track topics and decisions
    topics: dict[str, dict] = {}
    decisions: dict[str, dict] = {}
    
    for event in events:
        sender = event.get("sender_id", "")
        receiver = event.get("receiver_id", "")
        
        # Build communication graph
        if sender and receiver and sender != "unknown" and receiver != "unknown":
            key = (sender, receiver)
            pair_counts[key] = pair_counts.get(key, 0) + 1
        
        # Add person nodes
        if sender:
            G.add_node(sender, node_type=NODE_TYPE_PERSON, label=sender)
        if receiver:
            G.add_node(receiver, node_type=NODE_TYPE_PERSON, label=receiver)
        
        # Process topics
        for topic in event.get("topics", []):
            topic_id = f"topic_{hash(topic)}"
            if topic_id not in topics:
                topics[topic_id] = {"name": topic, "count": 0}
            topics[topic_id]["count"] += 1
            
            # Add topic node
            G.add_node(topic_id, node_type=NODE_TYPE_TOPIC, label=topic[:50])
            
            # Connect people to topics
            if sender:
                G.add_edge(sender, topic_id, edge_type=EDGE_MENTIONS_TOPIC, weight=1)
            if receiver:
                G.add_edge(topic_id, receiver, edge_type=EDGE_MENTIONS_TOPIC, weight=1)
        
        # Process decisions
        for decision in event.get("decisions", []):
            decision_id = f"decision_{hash(decision)}"
            if decision_id not in decisions:
                decisions[decision_id] = {"content": decision, "count": 0}
            decisions[decision_id]["count"] += 1
            
            # Add decision node
            G.add_node(decision_id, node_type=NODE_TYPE_DECISION, label=decision[:50])
            
            # Connect people to decisions
            if sender:
                G.add_edge(sender, decision_id, edge_type=EDGE_DECIDED_ON, weight=1)
            if receiver:
                G.add_edge(decision_id, receiver, edge_type=EDGE_DECIDED_ON, weight=1)
    
    # Add communication edges
    for (u, v), w in pair_counts.items():
        G.add_edge(u, v, weight=w, edge_type=EDGE_COMMUNICATES)
    
    return G


def graph_to_json(G: nx.DiGraph, path: Path | None = None) -> dict | None:
    """Export graph to a JSON structure for persistence and frontend (nodes + links)."""
    nodes = []
    for n in G.nodes():
        data = dict(G.nodes[n]) if G.nodes[n] else {}
        nodes.append({"id": n, **data})
    links = []
    for u, v, data in G.edges(data=True):
        links.append({"source": u, "target": v, **{k: v for k, v in data.items() if k != "edge_type"}})
    out = {"nodes": nodes, "links": links}
    if path:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=2, ensure_ascii=False)
        return None
    return out


def load_graph_from_json(path: Path) -> nx.DiGraph:
    """Load graph from our JSON format back into NetworkX."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    G = nx.DiGraph()
    for n in data.get("nodes", []):
        nid = n.pop("id")
        G.add_node(nid, **n)
    for L in data.get("links", []):
        src = L.pop("source")
        tgt = L.pop("target")
        G.add_edge(src, tgt, **L)
    return G
