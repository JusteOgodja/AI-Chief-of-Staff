# Backend API Specification - AI Chief of Staff
# Documentation for Lovable Frontend Development

## Overview
The AI Chief of Staff is an agentic AI system that maps organizational communication, builds knowledge graphs, and provides intelligent insights through specialized agents.

## Architecture Summary
- **Python Backend** with Streamlit dashboard
- **3 AI Agents**: Memory, Coordinator, Critic
- **Knowledge Graph**: People, Topics, Decisions with relationships
- **Source of Truth**: Versioned organizational knowledge
- **Real-time Processing**: Event simulation and updates

## API Endpoints & Data Structures

### 1. Agent Orchestration API
**Base URL**: Implicit through orchestrator.process_query()

#### Query Processing
```python
# Input: Natural language query string
query = "What changed today?"

# Output: Structured response
{
  "answer": "Changes in the last 24 hours:",
  "results": [...],           # For search results
  "changes": [...],           # For "what changed" queries
  "recommended_notifications": [...],  # For "who needs to know"
  "conflicts_found": 0,       # For conflict detection
  "reasoning": "AI reasoning explanation",
  "orchestration": {
    "query": "original query",
    "agent_used": "Memory Agent",
    "graph_nodes": 25,
    "graph_edges": 40,
    "truth_entries": 102
  }
}
```

#### Supported Query Types
1. **Memory Agent Queries**:
   - "What changed today?" → Returns recent organizational changes
   - "What is the current truth?" → Returns current decisions and topics
   - "Context for [person@email.com]" → Returns stakeholder context view

2. **Coordinator Agent Queries**:
   - "Who needs to know about [topic]?" → Returns routing recommendations
   - Input: Topic/content description
   - Output: List of prioritized stakeholders with centrality scores

3. **Critic Agent Queries**:
   - "Are there any conflicts?" → Returns detected contradictions
   - "Information overload for [person]" → Returns overload analysis
   - "Knowledge gaps for [topic]" → Returns knowledge gap analysis

### 2. Knowledge Graph Data Structure

#### Node Types
```python
# Person Node
{
  "id": "alice@company.com",
  "node_type": "person",
  "label": "alice@company.com",
  "connections": 15
}

# Topic Node
{
  "id": "topic_12345",
  "node_type": "topic", 
  "label": "product launch planning",
  "connections": 8
}

# Decision Node
{
  "id": "decision_67890",
  "node_type": "decision",
  "label": "proceed with Q4 product launch",
  "connections": 5
}
```

#### Edge Types
- `communicates_with`: Person → Person (weight = message count)
- `mentions_topic`: Person ↔ Topic
- `decided_on`: Person ↔ Decision

#### Graph Statistics
```python
{
  "total_nodes": 38,
  "people_nodes": 8,
  "topic_nodes": 17, 
  "decision_nodes": 13,
  "total_edges": 45,
  "network_density": 0.032
}
```

### 3. Source of Truth Data Structure

#### Truth Entry
```python
{
  "id": "decision_hash_123",
  "content": "proceed with Q4 product launch",
  "entity_type": "decision",  # "decision", "topic", "fact"
  "timestamp": "2026-02-08T01:30:00",
  "source_event_id": "demo_001",
  "version": 1,
  "previous_version_id": null,
  "confidence": 0.8,
  "metadata": {}
}
```

#### Recent Changes Response
```python
{
  "answer": "Changes in the last 24 hours:",
  "summary": {
    "total_changes": 12,
    "new_decisions": 3,
    "new_topics": 5,
    "new_facts": 4
  },
  "changes": [
    {
      "type": "decision",
      "content": "postpone Q4 product launch",
      "timestamp": "2026-02-08T01:30:00",
      "source": "demo_006",
      "version": 1
    }
  ]
}
```

### 4. Agent Responses Detail

#### Memory Agent - Context View
```python
{
  "answer": "Context for alice@company.com:",
  "relevant_truth": [
    {
      "content": "alice involved in product launch decision",
      "type": "fact",
      "timestamp": "2026-02-08T01:30:00"
    }
  ],
  "recent_changes": [...],
  "reasoning": "Found 5 relevant entries and 8 recent changes"
}
```

#### Coordinator Agent - Routing Recommendations
```python
{
  "answer": "People who need to know about this security issue:",
  "mentioned_people": ["frank@company.com"],
  "recommended_notifications": [
    {
      "person": "alice@company.com",
      "degree_centrality": 0.75,
      "betweenness_centrality": 0.45,
      "communication_volume": 25
    }
  ],
  "reasoning": "Analyzed 8 people, found 6 relevant stakeholders"
}
```

#### Critic Agent - Conflict Detection
```python
{
  "answer": "Conflicts detected in last 24 hours:",
  "conflicts_found": 4,
  "conflicts": [
    {
      "type": "decision_contradiction",
      "conflict_type": "proceed vs cancel",
      "decision1": "proceed with Q4 product launch",
      "decision2": "postpone Q4 product launch", 
      "times": ["2026-02-08T01:30:00", "2026-02-08T01:45:00"]
    }
  ],
  "reasoning": "Analyzed 12 recent entries, found 4 potential conflicts"
}
```

### 5. Real-time Event Processing

#### Event Simulation
```python
# Input Event
{
  "event_id": "demo_new_001",
  "sender_id": "grace@company.com",
  "receiver_id": "leadership@company.com", 
  "timestamp": "2026-02-08T02:30:00",
  "subject": "Emergency: Server Outage",
  "body": "Production server down, 2 hour recovery estimate",
  "topics": ["server outage", "production", "incident"],
  "decisions": ["engineering team working on outage"],
  "entities_mentioned": ["grace@company.com", "engineering@company.com"]
}

# Output Response
{
  "answer": "Event processed and knowledge updated:",
  "entries_created": ["fact_hash_123", "decision_hash_456"],
  "recommendations": ["alice@company.com", "bob@company.com"],
  "conflicts_detected": 0,
  "reasoning": "Processed event with 1 decisions and 1 topics"
}
```

## Current UI Components (Streamlit)

### 1. Main Dashboard Layout
- **4 Tabs**: Knowledge Graph, AI Chief of Staff, What Changed Today, Conflicts & Issues
- **Sidebar Stats**: People, Topics, Decisions, Truth Entries counts
- **Interactive Elements**: Query input, filters, expandable sections

### 2. Knowledge Graph Tab
- Graph statistics cards (Total Nodes, Edges, Network Density)
- Node type filter (All, person, topic, decision)
- Nodes table with ID, Type, Label, Connections
- Connection viewer for selected nodes

### 3. AI Chief of Staff Tab
- Query examples expander
- Natural language query input
- Response display with:
  - Main answer
  - Detailed results/changes
  - Recommended notifications
  - AI Reasoning expander
  - Orchestration details expander

### 4. What Changed Today Tab
- Summary metrics (Total Changes, New Decisions, New Topics, New Facts)
- Recent changes list with expandable details
- Timestamp and source information

### 5. Conflicts & Issues Tab
- Conflict detection button
- Information overload analysis
- Results display with visual indicators

## Data Flow Architecture

```
User Query → Agent Orchestrator → [Memory|Coordinator|Critic] Agent → Response
                                                    ↓
Knowledge Graph ←→ Source of Truth ←→ Event Processing
```

## Key Features to Preserve in Frontend

1. **Natural Language Interface**: Users type questions in plain English
2. **Multi-agent Responses**: Different agents for different query types
3. **Visual Graph Exploration**: Interactive knowledge graph
4. **Real-time Updates**: Event simulation and graph updates
5. **Transparency**: AI reasoning and orchestration details visible
6. **Professional Analytics**: KPIs, metrics, and business intelligence
7. **Conflict Detection**: Visual indicators for organizational issues
8. **Context Views**: Stakeholder context and relationship mapping

## Technical Constraints

- Backend runs on Python/Streamlit
- Data stored in JSON files (graph.json, truth.json)
- Agents process queries synchronously
- Graph uses NetworkX for calculations
- No authentication currently (future enhancement)

## Design Requirements

1. **Modern Professional UI**: Clean, enterprise-grade interface
2. **Data Visualization**: Interactive graphs, charts, and network diagrams
3. **Responsive Design**: Works on desktop and tablet
4. **Accessibility**: WCAG 2.1 compliance
5. **Performance**: Handle 1000+ nodes, 5000+ edges smoothly
6. **Real-time Feel**: Instant feedback and smooth transitions
7. **Dark/Light Mode**: Professional appearance options

## Brand Identity

- **Primary Color**: Blue gradient (#1e3a8a to #3b82f6)
- **Secondary Colors**: Green (#10b981), Orange (#f59e0b), Red (#ef4444)
- **Typography**: Clean, professional sans-serif
- **Icon Style**: Modern, consistent icon set
- **Layout**: Card-based, spacious, organized
