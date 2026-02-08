# Superhuman AI Chief of Staff

**AI Operating System for Organizational Communication** — an agentic system that maps information flow, builds a stakeholder and knowledge graph, and maintains a living source of truth.

## 🚀 Quick Start

### 1. Environment Setup
```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### 2. Configuration
```bash
cp .env.example .env
# Edit .env - LLM_PROVIDER=ollama by default (local, free)
```

### 3. Demo Setup (Recommended)
```bash
python -m demo.scenarios --setup
```
This creates realistic demo data with:
- 6 organizational events (decisions, topics, conflicts)
- Complete knowledge graph (people + topics + decisions)
- Versioned source of truth
- Pre-populated agent responses

### 4. Launch Dashboard
```bash
streamlit run dashboard/app.py
```

### 5. Try Demo Queries
In the dashboard, try these queries:
- "What changed today?"
- "What is the current truth?"
- "Who needs to know about security issues?"
- "Context for alice@company.com"
- "Are there any conflicts?"
- "Information overload for alice@company.com"

## 🏗️ Architecture

### Core Components
- **📊 Ingestion** - Parse emails/events → normalized communication events
- **🧠 Extraction** - LLM-powered topic/decision/entity extraction (Ollama/OpenAI/heuristic)
- **🕸️ Knowledge Graph** - People, topics, decisions with relationships
- **📚 Source of Truth** - Versioned organizational knowledge
- **🤖 AI Agents** - Memory, Coordinator, Critic with orchestration
- **📈 Dashboard** - Interactive visualization and query interface

### Agent Capabilities
- **Memory Agent**: "What changed today?", "What is the current truth?", "Context for [person]"
- **Coordinator Agent**: "Who needs to know this?", routing and amplification strategies
- **Critic Agent**: Conflict detection, information overload analysis, knowledge gaps

## 📋 Full Pipeline

### Option A: Demo Data (Fastest)
```bash
1. python -m demo.scenarios --setup
2. streamlit run dashboard/app.py
```

### Option B: Custom Data
```bash
1. python -m ingestion.mock_data                    # Generate test emails
2. python -m ingestion.run_ingestion                # Parse → events.json
3. python -m extraction.run_enrich                  # Extract topics/decisions
4. python -m graph.run_build                        # Build knowledge graph
5. python -m truth.populate_truth                   # Populate source of truth
6. streamlit run dashboard/app.py                   # Launch dashboard
```

## 🎯 Moonshot Challenge Features

### ✅ Implemented Features
- **Information Flow Mapping** - Complete communication graph with topics/decisions
- **Stakeholder & Knowledge Graph** - Multi-type nodes (people, topics, decisions) with relationships
- **Living Source of Truth** - Versioned decisions, topics, and facts
- **Agentic AI System** - Memory, Coordinator, Critic agents with orchestration
- **Intelligent Routing** - "Who needs to know this?" with network analysis
- **Conflict Detection** - Automatic contradiction and overload detection
- **Interactive Dashboard** - Multi-tab interface with visualizations
- **Real-time Updates** - Event simulation with automatic graph/truth updates

### 🔄 Query Examples
- **"What changed today?"** → Shows recent decisions, topics, and facts
- **"Who needs to know about X?"** → Recommends stakeholders based on graph topology
- **"Context for [person]"** → Provides stakeholder context view
- **"Are there any conflicts?"** → Detects contradictory decisions
- **"Information overload for [person]"** → Analyzes communication load

## 📊 Evaluation Criteria Alignment

| Criterion | Implementation |
|-----------|----------------|
| **Communication Intelligence** | ✅ Graph topology + routing algorithms |
| **Knowledge Graph & Stakeholder Map** | ✅ Multi-type nodes with relationships |
| **UI & Visualization** | ✅ Interactive dashboard with reasoning display |
| **UX & Interaction** | ✅ Natural language queries, minimal clicks |
| **Creativity & Moonshot** | ✅ Agentic AI orchestration system |
| **Deconfliction & Critique** | ✅ Conflict detection and overload analysis |
| **Demo Quality** | ✅ Complete scenarios with realistic data |

## 🛠️ Technical Stack

- **Backend**: Python 3.11+, NetworkX, Streamlit
- **AI/ML**: Ollama (default), OpenAI (optional), heuristic extraction
- **Graph**: NetworkX with JSON persistence
- **Data**: Pandas, JSON for event processing
- **UI**: Streamlit with interactive components

## 📁 Project Structure

```
├── agents/          # AI agents (Memory, Coordinator, Critic)
├── config/          # Settings and environment
├── dashboard/       # Streamlit UI
├── demo/            # Demo scenarios and setup
├── extraction/      # LLM-powered content extraction
├── graph/           # Knowledge graph construction
├── ingestion/       # Data parsing and normalization
├── truth/           # Versioned source of truth
└── data/            # Processed data and models
```

## 🎪 Demo Scenarios

The demo includes realistic organizational scenarios:
1. **Product Launch Decision** → Later postponed (conflict detection)
2. **Budget Reallocation** → Resource routing recommendations
3. **Customer Feedback** → Priority changes
4. **Security Issues** → Critical conflict with launch
5. **Emergency Outage** → Real-time event processing

## 🚀 Advanced Usage

### Simulate New Events
```bash
python -m demo.scenarios --simulate
```

### Custom LLM Provider
Edit `.env`:
- `LLM_PROVIDER=ollama` (default, local)
- `LLM_PROVIDER=openai` (requires OPENAI_API_KEY)
- `LLM_PROVIDER=none` (heuristic only)

### Voice Interface (Future)
- STT/TTS integration planned for voice queries
- Mobile-responsive design for on-the-go access

## 🏆 Why This Meets the Moonshot

This implementation transforms organizational communication from chaotic information flow to **intelligent, coordinated knowledge management**:

- **🧠 AI Chief of Staff**: Not a chatbot, but an intelligent coordinator
- **📊 Living Intelligence**: Continuous learning from organizational communication
- **🎯 Targeted Communication**: Routes information to the right people
- **⚡ Real-time Transparency**: Instant visibility into decisions and changes
- **🔍 Conflict Resolution**: Proactive detection of contradictions
- **📈 Knowledge Optimization**: Identifies gaps and overload patterns

The system demonstrates how AI can become the **brain of an organization** - seeing all communication, understanding dependencies, resolving conflicts, and creating transparency without overwhelming humans.

---

**Built for the HACNNATION Moonshot Challenge - Superhuman AI Chief of Staff**
