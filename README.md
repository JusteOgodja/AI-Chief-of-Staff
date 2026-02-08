# AI Chief of Staff

**AI Operating System for Organizational Communication** — An intelligent system that maps information flow, builds stakeholder knowledge graphs, and maintains a living source of truth.

## 🎯 Overview

AI Chief of Staff is an organizational intelligence platform that uses AI agents to analyze communication patterns, extract insights, and maintain a dynamic knowledge graph of your organization's information flow.

### Key Features

- **🧠 AI Agents**: Specialized agents for memory, coordination, and critical analysis
- **📊 Knowledge Graph**: Interactive visualization of people, topics, and decisions
- **💬 Natural Language Queries**: Ask questions about your organization in plain language
- **🔍 Conflict Detection**: Identify conflicting decisions and information overload
- **📈 Stakeholder Mapping**: Understand communication patterns and influence networks

## 🏗️ Architecture

```
AI Chief of Staff/
├── frontend_modern/          # React/Vite frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   └── lib/             # Utilities and API client
│   └── package.json
├── api/                      # FastAPI backend server
│   └── main.py              # API endpoints and orchestration
├── agents/                   # AI agent implementations
│   ├── orchestrator.py      # Main agent coordinator
│   ├── memory_agent.py      # Memory and knowledge management
│   ├── coordinator_agent.py # Communication coordination
│   └── critic_agent.py     # Conflict and overload detection
├── config/                   # Configuration management
│   └── settings.py          # Environment and settings
├── data/                     # Processed data storage
│   ├── processed/           # Graph and truth data
│   └── raw/                 # Original data files
├── extraction/               # Information extraction
│   └── extractor.py         # LLM-based content analysis
├── graph/                    # Graph management
│   └── manager.py          # NetworkX graph operations
├── ingestion/               # Data processing pipeline
│   └── processor.py         # Data transformation
├── truth/                   # Source of truth management
│   └── manager.py          # Truth data operations
├── scripts/                 # Utility scripts
│   ├── start-backend.py    # Backend server launcher
│   ├── start-frontend.sh   # Frontend launcher (Unix)
│   └── start-frontend.bat  # Frontend launcher (Windows)
├── .env.example             # Environment template
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Ollama** (for local LLM) or OpenAI API key

### 1. Environment Setup

```bash
# Clone and setup
git clone <repository-url>
cd AI Chief of Staff

# Create Python virtual environment
python -m venv .venv
.venv\Scripts\activate     # Windows
source .venv/bin/activate  # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
# Default: LLM_PROVIDER=ollama (local, free)
# Alternative: LLM_PROVIDER=openai (requires OPENAI_API_KEY)
```

### 3. LLM Setup

#### Option A: Ollama (Recommended - Free & Local)
```bash
# Install Ollama from https://ollama.ai
# Pull required model
ollama run llama3.2
```

#### Option B: OpenAI
```bash
# Add to .env
OPENAI_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
```

### 4. Launch Application

#### Method 1: Using Scripts (Recommended)
```bash
# Terminal 1 - Start Backend
python scripts/start-backend.py

# Terminal 2 - Start Frontend
cd frontend_modern
npm install
npm run dev
```

#### Method 2: Manual Launch
```bash
# Backend (Terminal 1)
.venv\Scripts\activate
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (Terminal 2)
cd frontend_modern
npm run dev
```

### 5. Access Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📱 Application Features

### Knowledge Graph
- Interactive visualization of organizational relationships
- Filter by people, topics, and decisions
- Search and explore connections
- Real-time statistics and insights

### AI Agent Interface
- Natural language queries about your organization
- Automatic agent routing based on query type
- Context-aware responses using organizational data
- Conflict and overload detection

### Analytics & Insights
- Communication pattern analysis
- Stakeholder influence mapping
- Decision tracking and versioning
- Information overload monitoring

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `ollama` | LLM provider: `ollama`, `openai`, or `none` |
| `OLLAMA_MODEL` | `llama3.2` | Ollama model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OPENAI_API_KEY` | - | OpenAI API key (if using OpenAI) |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name |

### Backend Configuration

The backend uses the following configuration:
- **Host**: 0.0.0.0 (accessible from any network interface)
- **Port**: 8000
- **CORS**: Allows frontend on localhost:8080 and localhost:3000

### Frontend Configuration

The frontend is configured with:
- **Development Server**: Vite on port 8080
- **Build Tool**: Vite with React and TypeScript
- **UI Framework**: Radix UI components with Tailwind CSS

## 🤖 AI Agents

### Memory Agent
- Maintains organizational knowledge and history
- Answers questions about current truth and past events
- Tracks changes and decisions over time

### Coordinator Agent
- Analyzes communication patterns
- Identifies key stakeholders and information flow
- Recommends communication strategies

### Critic Agent
- Detects conflicting decisions and information
- Identifies potential information overload
- Provides recommendations for resolution

## 📊 Data Model

### Knowledge Graph
- **Nodes**: People, topics, decisions
- **Edges**: Relationships and connections
- **Properties**: Metadata, timestamps, versions

### Source of Truth
- **Facts**: Verified organizational information
- **Decisions**: Official decisions with versions
- **Topics**: Key discussion topics and their evolution

## 🛠️ Development

### Backend Development
```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn api.main:app --reload

# Run tests
python -m pytest
```

### Frontend Development
```bash
# Install dependencies
cd frontend_modern
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Code Style
- **Python**: Follow PEP 8, use type hints
- **TypeScript**: ESLint + Prettier configuration
- **Components**: Functional components with hooks

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python environment
python --version
pip list | grep fastapi

# Verify dependencies
pip install -r requirements.txt
```

#### Frontend Build Errors
```bash
# Clear node modules
cd frontend_modern
rm -rf node_modules package-lock.json
npm install
```

#### Ollama Connection Issues
```bash
# Check Ollama status
ollama list
curl http://localhost:11434/api/tags

# Restart Ollama service
ollama serve
```

#### API Connection Errors
- Verify backend is running on port 8000
- Check CORS configuration
- Ensure frontend is on port 8080

### Logs and Debugging

- **Backend logs**: Console output from uvicorn
- **Frontend logs**: Browser developer tools console
- **API errors**: Check backend console for detailed error messages

## 📚 API Documentation

### Main Endpoints

- `GET /` - API information and endpoints
- `POST /api/query` - Process natural language queries
- `GET /api/graph/stats` - Get graph statistics
- `GET /api/graph/nodes` - Get graph nodes
- `GET /api/changes` - Get recent changes
- `POST /api/conflicts/detect` - Detect conflicts
- `GET /api/overload/{person_email}` - Check information overload

### Interactive Documentation

Visit http://localhost:8000/docs for interactive API documentation with Swagger UI.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow existing code style and patterns
- Add meaningful commit messages
- Update documentation for API changes
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section above

---

**Built with ❤️ using React, FastAPI, and modern AI technologies**
