"""
Build graph from data/processed/events_enriched.json and save to data/processed/graph.json.
Usage: python -m graph.run_build
"""
import json
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    events_path = project_root / "data" / "processed" / "events_enriched.json"
    graph_path = project_root / "data" / "processed" / "graph.json"

    if not events_path.exists():
        print(f"Enriched events not found: {events_path}. Run extraction first.")
        print("Try: python -m extraction.run_enrich")
        return

    events_data = json.loads(events_path.read_text(encoding="utf-8"))
    print(f"Loading {len(events_data)} enriched events...")
    
    from graph.builder import build_knowledge_graph, graph_to_json
    
    G = build_knowledge_graph(events_data)
    graph_to_json(G, graph_path)
    
    # Print statistics
    person_nodes = [n for n in G.nodes() if G.nodes[n].get("node_type") == "person"]
    topic_nodes = [n for n in G.nodes() if G.nodes[n].get("node_type") == "topic"]
    decision_nodes = [n for n in G.nodes() if G.nodes[n].get("node_type") == "decision"]
    
    print(f"Knowledge graph built:")
    print(f"  Total nodes: {G.number_of_nodes()}")
    print(f"  People: {len(person_nodes)}")
    print(f"  Topics: {len(topic_nodes)}")
    print(f"  Decisions: {len(decision_nodes)}")
    print(f"  Total edges: {G.number_of_edges()}")
    print(f"  Saved to: {graph_path}")


if __name__ == "__main__":
    main()
