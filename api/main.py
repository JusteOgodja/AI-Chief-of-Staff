"""
FastAPI server for AI Chief of Staff backend.
Provides REST API endpoints for the frontend to interact with AI agents.
"""
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Import agents
from agents.orchestrator import AgentOrchestrator

# Initialize FastAPI app
app = FastAPI(
    title="AI Chief of Staff API",
    description="Backend API for AI Chief of Staff organizational intelligence system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator (cached)
orchestrator = None

def get_orchestrator():
    global orchestrator
    if orchestrator is None:
        graph_path = ROOT / "data" / "processed" / "graph.json"
        truth_path = ROOT / "data" / "processed" / "truth.json"
        orchestrator = AgentOrchestrator(graph_path, truth_path)
    return orchestrator

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    answer: str
    results: Optional[List[Dict[str, Any]]] = None
    changes: Optional[List[Dict[str, Any]]] = None
    recommended_notifications: Optional[List[Dict[str, Any]]] = None
    reasoning: Optional[str] = None
    orchestration: Optional[Dict[str, Any]] = None
    conflicts_found: int = 0

class GraphStatsResponse(BaseModel):
    total_nodes: int
    total_edges: int
    people_count: int
    topics_count: int
    decisions_count: int
    density: float

class NodeInfo(BaseModel):
    id: str
    type: str
    label: str
    connections: int

class NodesResponse(BaseModel):
    nodes: List[NodeInfo]
    total_count: int

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "message": "AI Chief of Staff API",
        "version": "1.0.0",
        "endpoints": {
            "query": "/api/query",
            "graph_stats": "/api/graph/stats",
            "nodes": "/api/graph/nodes",
            "changes": "/api/changes",
            "conflicts": "/api/conflicts/detect",
            "overload": "/api/overload/{person_email}"
        }
    }

@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process a query using the AI agent orchestrator"""
    try:
        orch = get_orchestrator()
        response = orch.process_query(request.query)
        
        return QueryResponse(
            answer=response.get("answer", "No answer available"),
            results=response.get("results", []),
            changes=response.get("changes", []),
            recommended_notifications=response.get("recommended_notifications", []),
            reasoning=response.get("reasoning"),
            orchestration=response.get("orchestration", {}),
            conflicts_found=len(response.get("conflicts", []))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/api/graph/stats", response_model=GraphStatsResponse)
async def get_graph_stats():
    """Get knowledge graph statistics"""
    try:
        orch = get_orchestrator()
        graph = orch.graph
        
        people_count = len([n for n in graph.nodes() if graph.nodes[n].get("node_type") == "person"])
        topics_count = len([n for n in graph.nodes() if graph.nodes[n].get("node_type") == "topic"])
        decisions_count = len([n for n in graph.nodes() if graph.nodes[n].get("node_type") == "decision"])
        
        import networkx as nx
        density = nx.density(graph)
        
        return GraphStatsResponse(
            total_nodes=graph.number_of_nodes(),
            total_edges=graph.number_of_edges(),
            people_count=people_count,
            topics_count=topics_count,
            decisions_count=decisions_count,
            density=density
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting graph stats: {str(e)}")

@app.get("/api/graph/nodes", response_model=NodesResponse)
async def get_nodes(node_type: Optional[str] = None, limit: int = 50):
    """Get nodes from the knowledge graph"""
    try:
        orch = get_orchestrator()
        graph = orch.graph
        
        if node_type and node_type != "all":
            filtered_nodes = [n for n in graph.nodes() 
                             if graph.nodes[n].get("node_type") == node_type]
        else:
            filtered_nodes = list(graph.nodes())
        
        nodes_data = []
        for node in filtered_nodes[:limit]:
            node_data = graph.nodes[node]
            nodes_data.append(NodeInfo(
                id=node,
                type=node_data.get("node_type", "unknown"),
                label=node_data.get("label", node)[:50],
                connections=graph.degree(node)
            ))
        
        return NodesResponse(
            nodes=nodes_data,
            total_count=len(filtered_nodes)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting nodes: {str(e)}")

@app.get("/api/changes")
async def get_changes(hours: int = 24):
    """Get recent changes"""
    try:
        orch = get_orchestrator()
        changes_response = orch.memory_agent.what_changed_today(hours=hours)
        return changes_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting changes: {str(e)}")

@app.post("/api/conflicts/detect")
async def detect_conflicts():
    """Detect conflicts in the system"""
    try:
        orch = get_orchestrator()
        conflicts_response = orch.critic_agent.detect_conflicts()
        return conflicts_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting conflicts: {str(e)}")

@app.get("/api/overload/{person_email}")
async def check_overload(person_email: str):
    """Check information overload for a person"""
    try:
        orch = get_orchestrator()
        overload_response = orch.critic_agent.detect_overload(person_email)
        return overload_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking overload: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        orch = get_orchestrator()
        return {
            "status": "healthy",
            "graph_nodes": orch.graph.number_of_nodes(),
            "truth_entries": len(orch.truth.entries)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
