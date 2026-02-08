"""
Streamlit dashboard: Knowledge Graph + Stakeholder Map visualization with AI agents.
Run from project root: streamlit run dashboard/app.py
"""
import json
import sys
from pathlib import Path

import streamlit as st
import networkx as nx
import pandas as pd

# Project root
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

st.set_page_config(page_title="AI Chief of Staff", layout="wide")
st.title("🧠 Superhuman AI Chief of Staff")
st.caption("Organizational communication intelligence — Knowledge graph & stakeholder map")

# Initialize orchestrator
@st.cache_resource
def get_orchestrator():
    from agents.orchestrator import AgentOrchestrator
    graph_path = ROOT / "data" / "processed" / "graph.json"
    truth_path = ROOT / "data" / "processed" / "truth.json"
    return AgentOrchestrator(graph_path, truth_path)

orchestrator = get_orchestrator()

# Sidebar stats
st.sidebar.header("📊 System Stats")
st.sidebar.metric("People", len([n for n in orchestrator.graph.nodes() if orchestrator.graph.nodes[n].get("node_type") == "person"]))
st.sidebar.metric("Topics", len([n for n in orchestrator.graph.nodes() if orchestrator.graph.nodes[n].get("node_type") == "topic"]))
st.sidebar.metric("Decisions", len([n for n in orchestrator.graph.nodes() if orchestrator.graph.nodes[n].get("node_type") == "decision"]))
st.sidebar.metric("Truth Entries", len(orchestrator.truth.entries))

# Main tabs
tab1, tab2, tab3, tab4 = st.tabs(["🕸️ Knowledge Graph", "🤖 AI Chief of Staff", "📈 What Changed Today", "⚠️ Conflicts & Issues"])

with tab1:
    st.header("Knowledge Graph Visualization")
    
    # Graph statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Nodes", orchestrator.graph.number_of_nodes())
    with col2:
        st.metric("Total Edges", orchestrator.graph.number_of_edges())
    with col3:
        # Calculate network density
        density = nx.density(orchestrator.graph)
        st.metric("Network Density", f"{density:.3f}")
    
    # Interactive node exploration
    st.subheader("Explore Nodes")
    node_types = ["All", "person", "topic", "decision"]
    selected_type = st.selectbox("Filter by node type:", node_types)
    
    # Filter nodes
    if selected_type == "All":
        filtered_nodes = list(orchestrator.graph.nodes())
    else:
        filtered_nodes = [n for n in orchestrator.graph.nodes() 
                         if orchestrator.graph.nodes[n].get("node_type") == selected_type]
    
    if filtered_nodes:
        # Display nodes table
        nodes_data = []
        for node in filtered_nodes[:50]:  # Limit to 50 for performance
            node_data = orchestrator.graph.nodes[node]
            nodes_data.append({
                "ID": node,
                "Type": node_data.get("node_type", "unknown"),
                "Label": node_data.get("label", node)[:50],
                "Connections": orchestrator.graph.degree(node)
            })
        
        df_nodes = pd.DataFrame(nodes_data)
        st.dataframe(df_nodes, use_container_width=True)
        
        # Show connections for selected node
        if st.button("Show Connections for Selected Node"):
            selected_node = st.selectbox("Select node:", filtered_nodes)
            if selected_node:
                neighbors = list(orchestrator.graph.neighbors(selected_node)) + list(orchestrator.graph.predecessors(selected_node))
                st.write(f"**Connections for {selected_node}:** {len(neighbors)}")
                if neighbors:
                    neighbor_data = [{"Neighbor": n, "Type": orchestrator.graph.nodes[n].get("node_type", "unknown")} for n in neighbors[:20]]
                    st.dataframe(pd.DataFrame(neighbor_data), use_container_width=True)

with tab2:
    st.header("🤖 Ask the AI Chief of Staff")
    st.write("Ask questions about organizational knowledge, communication, and decisions.")
    
    # Query examples
    with st.expander("💡 Example queries"):
        st.markdown("""
        - What changed today?
        - What is the current truth?
        - Who needs to know [topic]?
        - Context for [person@email.com]?
        - Are there any conflicts?
        - Information overload for [person@email.com]?
        - Knowledge gaps for [topic]?
        """)
    
    # Query input
    query = st.text_input("Ask the Chief of Staff:", placeholder="e.g., What changed today?")
    
    if st.button("🔍 Ask") and query:
        with st.spinner("AI agents are processing your query..."):
            response = orchestrator.process_query(query)
            
            # Display answer
            st.subheader("🎯 Answer")
            st.write(response.get("answer", "No answer available"))
            
            # Display detailed results if available
            if "results" in response:
                st.subheader("📋 Results")
                for result in response.get("results", []):
                    st.write(f"• {result.get('content', 'No content')}")
                    st.caption(f"Source: {result.get('source', 'Unknown')} | Confidence: {result.get('confidence', 'N/A')}")
            
            if "changes" in response:
                st.subheader("📝 Changes")
                for change in response.get("changes", []):
                    st.write(f"• **{change.get('type', 'unknown').title()}**: {change.get('content', 'No content')}")
                    st.caption(f"Time: {change.get('timestamp', 'Unknown')}")
            
            if "recommended_notifications" in response:
                st.subheader("📢 Recommended Notifications")
                notifications = response.get("recommended_notifications", [])
                if notifications:
                    for notif in notifications[:10]:
                        person = notif.get("person", notif) if isinstance(notif, dict) else notif
                        st.write(f"• {person}")
                else:
                    st.write("No specific recommendations")
            
            # Display reasoning
            if "reasoning" in response:
                with st.expander("🧠 AI Reasoning"):
                    st.write(response.get("reasoning"))
            
            # Display orchestration metadata
            if "orchestration" in response:
                with st.expander("⚙️ Orchestration Details"):
                    orch = response.get("orchestration", {})
                    st.write(f"**Agent used:** {orch.get('agent_used', 'Unknown')}")
                    st.write(f"**Graph nodes:** {orch.get('graph_nodes', 0)}")
                    st.write(f"**Graph edges:** {orch.get('graph_edges', 0)}")
                    st.write(f"**Truth entries:** {orch.get('truth_entries', 0)}")

with tab3:
    st.header("📈 What Changed Today")
    
    # Get recent changes
    with st.spinner("Analyzing recent changes..."):
        changes_response = orchestrator.memory_agent.what_changed_today(hours=24)
    
    # Summary
    summary = changes_response.get("summary", {})
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Changes", summary.get("total_changes", 0))
    with col2:
        st.metric("New Decisions", summary.get("new_decisions", 0))
    with col3:
        st.metric("New Topics", summary.get("new_topics", 0))
    with col4:
        st.metric("New Facts", summary.get("new_facts", 0))
    
    # Recent changes list
    st.subheader("🕐 Recent Changes (Last 24 Hours)")
    changes = changes_response.get("changes", [])
    if changes:
        for change in changes:
            with st.expander(f"📄 {change.get('type', 'unknown').title()} - {change.get('timestamp', 'Unknown')[:19]}"):
                st.write(change.get('content', 'No content'))
                st.caption(f"Source: {change.get('source', 'Unknown')} | Version: {change.get('version', 1)}")
    else:
        st.info("No recent changes found in the last 24 hours.")

with tab4:
    st.header("⚠️ Conflicts & Issues")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🔥 Conflicts Detection")
        if st.button("Detect Conflicts"):
            with st.spinner("Scanning for conflicts..."):
                conflicts_response = orchestrator.critic_agent.detect_conflicts()
            
            st.metric("Conflicts Found", conflicts_response.get("conflicts_found", 0))
            
            conflicts = conflicts_response.get("conflicts", [])
            if conflicts:
                for i, conflict in enumerate(conflicts):
                    with st.expander(f"⚠️ Conflict {i+1}: {conflict.get('conflict_type', 'Unknown')}"):
                        if "decision1" in conflict:
                            st.write("**Decision 1:**", conflict.get("decision1", ""))
                            st.write("**Decision 2:**", conflict.get("decision2", ""))
                        elif "topic1" in conflict:
                            st.write("**Topic 1:**", conflict.get("topic1", ""))
                            st.write("**Topic 2:**", conflict.get("topic2", ""))
            else:
                st.success("No conflicts detected!")
    
    with col2:
        st.subheader("📊 Information Overload")
        person_email = st.text_input("Person email:", placeholder="person@company.com")
        
        if st.button("Check Overload") and person_email:
            with st.spinner("Analyzing information load..."):
                overload_response = orchestrator.critic_agent.detect_overload(person_email)
            
            is_overloaded = overload_response.get("is_overloaded", False)
            if is_overloaded:
                st.error("⚠️ INFORMATION OVERLOAD DETECTED")
            else:
                st.success("✅ Information load is manageable")
            
            st.metric("Relevant Changes", overload_response.get("relevant_changes", 0))
            st.metric("Threshold", overload_response.get("threshold", 10))
            
            breakdown = overload_response.get("breakdown", {})
            st.write("**Breakdown:**")
            st.write(f"• Decisions: {breakdown.get('decisions', 0)}")
            st.write(f"• Topics: {breakdown.get('topics', 0)}")
            st.write(f"• Other: {breakdown.get('other', 0)}")
            
            st.write("**Recommendation:**", overload_response.get("recommendation", ""))

# Footer
st.divider()
st.markdown("---")
st.caption("Superhuman AI Chief of Staff - Organizational Intelligence System")
