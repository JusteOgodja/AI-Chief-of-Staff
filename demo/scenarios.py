"""Demo scenarios for the AI Chief of Staff."""
import json
from pathlib import Path
from datetime import datetime, timedelta


def create_demo_events() -> list[dict]:
    """Create realistic demo events for showcasing the AI Chief of Staff."""
    
    # Base time for all events
    base_time = datetime.now() - timedelta(hours=12)
    
    events = [
        {
            "event_id": "demo_001",
            "sender_id": "alice@company.com",
            "receiver_id": "bob@company.com",
            "timestamp": (base_time - timedelta(hours=10)).isoformat(),
            "subject": "Q4 Product Launch Decision",
            "body": "We have decided to proceed with the Q4 product launch. The marketing team will prepare the campaign and engineering will finalize the features by end of month.",
            "thread_id": "launch_q4",
            "source": "email",
            "topics": ["product launch", "Q4 planning", "marketing campaign"],
            "decisions": ["proceed with Q4 product launch", "marketing team prepares campaign", "engineering finalizes features"],
            "entities_mentioned": ["alice@company.com", "bob@company.com", "marketing@company.com", "engineering@company.com"]
        },
        {
            "event_id": "demo_002",
            "sender_id": "carol@company.com",
            "receiver_id": "team@company.com",
            "timestamp": (base_time - timedelta(hours=8)).isoformat(),
            "subject": "Budget Reallocation Discussion",
            "body": "After reviewing our Q3 performance, we need to reallocate budget from the legacy project to the new AI initiative. This will help us accelerate development.",
            "thread_id": "budget_2024",
            "source": "email",
            "topics": ["budget", "resource allocation", "AI initiative"],
            "decisions": ["reallocate budget from legacy project", "fund new AI initiative"],
            "entities_mentioned": ["carol@company.com", "team@company.com", "finance@company.com"]
        },
        {
            "event_id": "demo_003",
            "sender_id": "david@company.com",
            "receiver_id": "alice@company.com",
            "timestamp": (base_time - timedelta(hours=6)).isoformat(),
            "subject": "Customer Feedback Analysis",
            "body": "Customer feedback indicates strong demand for the mobile app features. We should prioritize mobile development in the next sprint.",
            "thread_id": "customer_feedback",
            "source": "email",
            "topics": ["customer feedback", "mobile app", "development priorities"],
            "decisions": ["prioritize mobile app development", "include in next sprint"],
            "entities_mentioned": ["david@company.com", "alice@company.com", "customers@company.com"]
        },
        {
            "event_id": "demo_004",
            "sender_id": "eve@company.com",
            "receiver_id": "bob@company.com",
            "timestamp": (base_time - timedelta(hours=4)).isoformat(),
            "subject": "Team Meeting Schedule Change",
            "body": "We need to cancel the weekly sync this Thursday due to the all-hands meeting. Let's reschedule for Friday afternoon.",
            "thread_id": "meetings",
            "source": "email",
            "topics": ["meeting schedule", "team sync", "all-hands"],
            "decisions": ["cancel Thursday sync", "reschedule for Friday"],
            "entities_mentioned": ["eve@company.com", "bob@company.com", "team@company.com"]
        },
        {
            "event_id": "demo_005",
            "sender_id": "frank@company.com",
            "receiver_id": "carol@company.com",
            "timestamp": (base_time - timedelta(hours=2)).isoformat(),
            "subject": "Security Audit Results",
            "body": "The security audit identified several critical vulnerabilities in the legacy system. We recommend immediate patching before the product launch.",
            "thread_id": "security",
            "source": "email",
            "topics": ["security", "audit", "vulnerabilities", "legacy system"],
            "decisions": ["patch critical vulnerabilities", "address before product launch"],
            "entities_mentioned": ["frank@company.com", "carol@company.com", "security@company.com"]
        },
        {
            "event_id": "demo_006",
            "sender_id": "alice@company.com",
            "receiver_id": "all@company.com",
            "timestamp": (base_time - timedelta(hours=1)).isoformat(),
            "subject": "IMPORTANT: Launch Postponed",
            "body": "Due to critical security issues identified, we are postponing the Q4 product launch until all vulnerabilities are resolved. New launch date TBD.",
            "thread_id": "launch_q4",
            "source": "email",
            "topics": ["product launch", "security", "postponement"],
            "decisions": ["postpone Q4 product launch", "resolve security issues first"],
            "entities_mentioned": ["alice@company.com", "all@company.com", "frank@company.com"]
        }
    ]
    
    return events


def run_demo_setup() -> None:
    """Set up demo data and populate all systems."""
    project_root = Path(__file__).resolve().parent.parent
    
    print("🚀 Setting up AI Chief of Staff Demo...")
    
    # 1. Create demo events
    print("📝 Creating demo events...")
    events = create_demo_events()
    
    # Save enriched events
    enriched_path = project_root / "data" / "processed" / "events_enriched.json"
    enriched_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(enriched_path, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created {len(events)} demo events in {enriched_path}")
    
    # 2. Build knowledge graph
    print("🕸️ Building knowledge graph...")
    from graph.builder import build_knowledge_graph, graph_to_json
    
    G = build_knowledge_graph(events)
    graph_path = project_root / "data" / "processed" / "graph.json"
    graph_to_json(G, graph_path)
    
    person_nodes = [n for n in G.nodes() if G.nodes[n].get("node_type") == "person"]
    topic_nodes = [n for n in G.nodes() if G.nodes[n].get("node_type") == "topic"]
    decision_nodes = [n for n in G.nodes() if G.nodes[n].get("node_type") == "decision"]
    
    print(f"✅ Knowledge graph: {len(person_nodes)} people, {len(topic_nodes)} topics, {len(decision_nodes)} decisions")
    
    # 3. Populate source of truth
    print("📚 Populating source of truth...")
    from truth.populate_truth import populate_truth_from_events
    
    truth_path = project_root / "data" / "processed" / "truth.json"
    populate_truth_from_events(enriched_path, truth_path)
    
    # 4. Test agents
    print("🤖 Testing AI agents...")
    from agents.orchestrator import AgentOrchestrator
    
    orchestrator = AgentOrchestrator(graph_path, truth_path)
    
    # Test Memory Agent
    print("\n📈 Testing: What changed today?")
    response = orchestrator.process_query("What changed today?")
    print(f"Answer: {response.get('answer', 'No answer')}")
    
    # Test Coordinator Agent
    print("\n📢 Testing: Who needs to know about security issues?")
    response = orchestrator.process_query("Who needs to know about security issues?")
    print(f"Answer: {response.get('answer', 'No answer')}")
    
    # Test Critic Agent
    print("\n⚠️ Testing: Are there any conflicts?")
    response = orchestrator.process_query("Are there any conflicts?")
    print(f"Answer: {response.get('answer', 'No answer')}")
    print(f"Conflicts found: {response.get('conflicts_found', 0)}")
    
    print("\n🎉 Demo setup complete!")
    print("\n📋 Demo scenarios you can try:")
    print("1. 'What changed today?' - See recent organizational changes")
    print("2. 'What is the current truth?' - Get latest decisions and topics")
    print("3. 'Who needs to know about the launch postponement?' - See routing recommendations")
    print("4. 'Context for alice@company.com' - Get stakeholder context")
    print("5. 'Information overload for alice@company.com' - Check for information overload")
    print("6. 'Knowledge gaps for security' - Find knowledge gaps")
    print("\n🚀 Run: streamlit run dashboard/app.py")


def simulate_new_event() -> None:
    """Simulate a new event coming in to test real-time processing."""
    project_root = Path(__file__).resolve().parent.parent
    
    # Create a new event
    new_event = {
        "event_id": "demo_new_001",
        "sender_id": "grace@company.com",
        "receiver_id": "leadership@company.com",
        "timestamp": datetime.now().isoformat(),
        "subject": "Emergency: Server Outage",
        "body": "We are experiencing a server outage affecting the production environment. The engineering team is working on it. Estimated recovery time is 2 hours.",
        "thread_id": "incident",
        "source": "email",
        "topics": ["server outage", "production", "incident"],
        "decisions": ["engineering team working on outage", "2 hour recovery estimate"],
        "entities_mentioned": ["grace@company.com", "leadership@company.com", "engineering@company.com"]
    }
    
    print("🚨 Simulating new event: Server Outage")
    
    # Load orchestrator
    graph_path = project_root / "data" / "processed" / "graph.json"
    truth_path = project_root / "data" / "processed" / "truth.json"
    
    from agents.orchestrator import AgentOrchestrator
    orchestrator = AgentOrchestrator(graph_path, truth_path)
    
    # Process the event
    response = orchestrator.simulate_event_update(new_event)
    
    print(f"✅ Event processed: {response.get('answer', 'No answer')}")
    print(f"📢 Recommendations: {len(response.get('recommendations', []))} people notified")
    print(f"⚠️ New conflicts: {response.get('conflicts_detected', 0)}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Demo scenarios for AI Chief of Staff")
    parser.add_argument("--setup", action="store_true", help="Set up demo data")
    parser.add_argument("--simulate", action="store_true", help="Simulate new event")
    
    args = parser.parse_args()
    
    if args.setup:
        run_demo_setup()
    elif args.simulate:
        simulate_new_event()
    else:
        print("Use --setup to initialize demo or --simulate to test new event processing")
