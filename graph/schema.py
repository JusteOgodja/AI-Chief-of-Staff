"""
Schema for Knowledge Graph and Stakeholder Map.
Nodes: Person, Team, Topic, Decision.
Edges: communicates_with, works_on, decided_on, depends_on.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Person:
    id: str
    label: str | None = None
    email: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Topic:
    id: str
    label: str
    description: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Decision:
    id: str
    subject: str
    summary: str
    timestamp: str
    source_event_id: str
    version: int = 1
    previous_version_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


# Relation types for the graph
EDGE_COMMUNICATES = "communicates_with"
EDGE_WORKS_ON = "works_on"
EDGE_DECIDED_ON = "decided_on"
EDGE_DEPENDS_ON = "depends_on"
EDGE_MENTIONS_TOPIC = "mentions_topic"

NODE_TYPE_PERSON = "person"
NODE_TYPE_TOPIC = "topic"
NODE_TYPE_DECISION = "decision"
NODE_TYPE_TEAM = "team"
