import type {
  GraphNode,
  GraphEdge,
  GraphStats,
  ChangeItem,
  ChangeSummary,
  ActivityItem,
  Conflict,
  QueryResponse,
} from "./types";

// ── Graph Nodes ──────────────────────────────────────────────
export const mockNodes: GraphNode[] = [
  { id: "alice@company.com", node_type: "person", label: "Alice Chen", connections: 15 },
  { id: "bob@company.com", node_type: "person", label: "Bob Martinez", connections: 12 },
  { id: "carol@company.com", node_type: "person", label: "Carol Wu", connections: 9 },
  { id: "david@company.com", node_type: "person", label: "David Kim", connections: 8 },
  { id: "eve@company.com", node_type: "person", label: "Eve Johnson", connections: 11 },
  { id: "frank@company.com", node_type: "person", label: "Frank Lee", connections: 7 },
  { id: "grace@company.com", node_type: "person", label: "Grace Park", connections: 6 },
  { id: "henry@company.com", node_type: "person", label: "Henry Davis", connections: 5 },
  { id: "topic_launch", node_type: "topic", label: "Q4 Product Launch", connections: 8 },
  { id: "topic_security", node_type: "topic", label: "Security Audit", connections: 6 },
  { id: "topic_budget", node_type: "topic", label: "Budget Planning", connections: 5 },
  { id: "topic_hiring", node_type: "topic", label: "Engineering Hiring", connections: 7 },
  { id: "topic_infra", node_type: "topic", label: "Infrastructure Migration", connections: 4 },
  { id: "topic_design", node_type: "topic", label: "Design System V2", connections: 3 },
  { id: "topic_ai", node_type: "topic", label: "AI Strategy", connections: 9 },
  { id: "topic_compliance", node_type: "topic", label: "Compliance Review", connections: 4 },
  { id: "topic_roadmap", node_type: "topic", label: "Product Roadmap", connections: 6 },
  { id: "topic_perf", node_type: "topic", label: "Performance Review Cycle", connections: 3 },
  { id: "topic_partner", node_type: "topic", label: "Partner Integration", connections: 5 },
  { id: "topic_data", node_type: "topic", label: "Data Pipeline", connections: 4 },
  { id: "topic_mobile", node_type: "topic", label: "Mobile App v3", connections: 6 },
  { id: "topic_onboard", node_type: "topic", label: "Onboarding Flow", connections: 3 },
  { id: "topic_metrics", node_type: "topic", label: "OKR Tracking", connections: 5 },
  { id: "topic_outage", node_type: "topic", label: "Incident Response", connections: 4 },
  { id: "decision_launch_go", node_type: "decision", label: "Proceed with Q4 launch", connections: 5 },
  { id: "decision_launch_delay", node_type: "decision", label: "Postpone launch 2 weeks", connections: 3 },
  { id: "decision_budget_cut", node_type: "decision", label: "Reduce marketing budget 15%", connections: 4 },
  { id: "decision_hire_5", node_type: "decision", label: "Hire 5 senior engineers", connections: 6 },
  { id: "decision_aws", node_type: "decision", label: "Migrate to AWS", connections: 4 },
  { id: "decision_ai_invest", node_type: "decision", label: "Invest in AI tooling", connections: 5 },
  { id: "decision_sec_audit", node_type: "decision", label: "External security audit Q1", connections: 3 },
  { id: "decision_mobile_react", node_type: "decision", label: "Use React Native for mobile", connections: 4 },
  { id: "decision_okr_q", node_type: "decision", label: "Quarterly OKR cadence", connections: 3 },
  { id: "decision_partner_api", node_type: "decision", label: "Build partner API first", connections: 4 },
  { id: "decision_freeze", node_type: "decision", label: "Code freeze Dec 15", connections: 5 },
  { id: "decision_oncall", node_type: "decision", label: "24/7 on-call rotation", connections: 3 },
  { id: "decision_design_token", node_type: "decision", label: "Adopt design tokens", connections: 2 },
];

export const mockEdges: GraphEdge[] = [
  { source: "alice@company.com", target: "bob@company.com", edge_type: "communicates_with", weight: 25 },
  { source: "alice@company.com", target: "carol@company.com", edge_type: "communicates_with", weight: 18 },
  { source: "alice@company.com", target: "eve@company.com", edge_type: "communicates_with", weight: 20 },
  { source: "bob@company.com", target: "david@company.com", edge_type: "communicates_with", weight: 14 },
  { source: "bob@company.com", target: "frank@company.com", edge_type: "communicates_with", weight: 10 },
  { source: "carol@company.com", target: "grace@company.com", edge_type: "communicates_with", weight: 8 },
  { source: "david@company.com", target: "henry@company.com", edge_type: "communicates_with", weight: 6 },
  { source: "eve@company.com", target: "frank@company.com", edge_type: "communicates_with", weight: 12 },
  { source: "alice@company.com", target: "topic_launch", edge_type: "mentions_topic", weight: 15 },
  { source: "alice@company.com", target: "topic_ai", edge_type: "mentions_topic", weight: 12 },
  { source: "bob@company.com", target: "topic_security", edge_type: "mentions_topic", weight: 10 },
  { source: "bob@company.com", target: "topic_hiring", edge_type: "mentions_topic", weight: 8 },
  { source: "carol@company.com", target: "topic_budget", edge_type: "mentions_topic", weight: 9 },
  { source: "carol@company.com", target: "topic_compliance", edge_type: "mentions_topic", weight: 7 },
  { source: "david@company.com", target: "topic_infra", edge_type: "mentions_topic", weight: 11 },
  { source: "eve@company.com", target: "topic_design", edge_type: "mentions_topic", weight: 6 },
  { source: "eve@company.com", target: "topic_roadmap", edge_type: "mentions_topic", weight: 8 },
  { source: "frank@company.com", target: "topic_mobile", edge_type: "mentions_topic", weight: 9 },
  { source: "grace@company.com", target: "topic_data", edge_type: "mentions_topic", weight: 7 },
  { source: "henry@company.com", target: "topic_outage", edge_type: "mentions_topic", weight: 5 },
  { source: "alice@company.com", target: "decision_launch_go", edge_type: "decided_on", weight: 5 },
  { source: "alice@company.com", target: "decision_ai_invest", edge_type: "decided_on", weight: 4 },
  { source: "bob@company.com", target: "decision_hire_5", edge_type: "decided_on", weight: 6 },
  { source: "bob@company.com", target: "decision_sec_audit", edge_type: "decided_on", weight: 3 },
  { source: "carol@company.com", target: "decision_budget_cut", edge_type: "decided_on", weight: 4 },
  { source: "david@company.com", target: "decision_aws", edge_type: "decided_on", weight: 5 },
  { source: "eve@company.com", target: "decision_mobile_react", edge_type: "decided_on", weight: 4 },
  { source: "frank@company.com", target: "decision_partner_api", edge_type: "decided_on", weight: 3 },
  { source: "grace@company.com", target: "decision_oncall", edge_type: "decided_on", weight: 2 },
  { source: "alice@company.com", target: "decision_freeze", edge_type: "decided_on", weight: 5 },
  { source: "topic_launch", target: "decision_launch_go", edge_type: "decided_on", weight: 4 },
  { source: "topic_launch", target: "decision_launch_delay", edge_type: "decided_on", weight: 3 },
  { source: "topic_hiring", target: "decision_hire_5", edge_type: "decided_on", weight: 5 },
  { source: "topic_infra", target: "decision_aws", edge_type: "decided_on", weight: 4 },
  { source: "topic_ai", target: "decision_ai_invest", edge_type: "decided_on", weight: 3 },
];

export const mockGraphStats: GraphStats = {
  total_nodes: 38,
  people_nodes: 8,
  topic_nodes: 17,
  decision_nodes: 13,
  total_edges: 45,
  network_density: 0.032,
};

// ── Changes ──────────────────────────────────────────────────
export const mockChangeSummary: ChangeSummary = {
  total_changes: 12,
  new_decisions: 3,
  new_topics: 5,
  new_facts: 4,
};

export const mockChanges: ChangeItem[] = [
  { type: "decision", content: "Postpone Q4 product launch by 2 weeks due to security concerns", timestamp: "2026-02-08T09:30:00", source: "Leadership sync", version: 2 },
  { type: "topic", content: "New infrastructure migration timeline proposed for Q1 2026", timestamp: "2026-02-08T09:15:00", source: "Engineering standup", version: 1 },
  { type: "fact", content: "Security audit identified 3 critical vulnerabilities in auth module", timestamp: "2026-02-08T08:45:00", source: "Security team report", version: 1 },
  { type: "decision", content: "Hire 5 senior engineers for platform team by end of Q1", timestamp: "2026-02-08T08:30:00", source: "HR planning meeting", version: 1 },
  { type: "topic", content: "AI strategy discussion moved to biweekly cadence", timestamp: "2026-02-08T08:00:00", source: "Product council", version: 1 },
  { type: "fact", content: "Mobile app v3 beta downloads reached 10,000 milestone", timestamp: "2026-02-08T07:45:00", source: "Analytics dashboard", version: 1 },
  { type: "decision", content: "Adopt design tokens system for component library", timestamp: "2026-02-07T17:30:00", source: "Design review", version: 1 },
  { type: "topic", content: "Partner API integration requirements finalized", timestamp: "2026-02-07T16:00:00", source: "Partner meeting", version: 2 },
  { type: "fact", content: "Q3 revenue exceeded targets by 12%", timestamp: "2026-02-07T15:00:00", source: "Finance report", version: 1 },
  { type: "decision", content: "Code freeze scheduled for December 15th", timestamp: "2026-02-07T14:00:00", source: "Release planning", version: 1 },
  { type: "topic", content: "Onboarding flow redesign kickoff scheduled", timestamp: "2026-02-07T11:00:00", source: "Product team", version: 1 },
  { type: "fact", content: "Team satisfaction survey results: 4.2/5 average", timestamp: "2026-02-07T10:00:00", source: "People ops", version: 1 },
];

// ── Conflicts ────────────────────────────────────────────────
export const mockConflicts: Conflict[] = [
  {
    type: "decision_contradiction",
    conflict_type: "proceed vs postpone",
    decision1: "Proceed with Q4 product launch",
    decision2: "Postpone Q4 product launch by 2 weeks",
    times: ["2026-02-08T01:30:00", "2026-02-08T09:30:00"],
  },
  {
    type: "decision_contradiction",
    conflict_type: "expand vs reduce",
    decision1: "Hire 5 senior engineers for platform team",
    decision2: "Reduce marketing budget by 15%",
    times: ["2026-02-08T08:30:00", "2026-02-07T14:00:00"],
  },
  {
    type: "information_conflict",
    conflict_type: "timeline mismatch",
    decision1: "Infrastructure migration Q1 2026",
    decision2: "Code freeze December 15th (blocks migration prep)",
    times: ["2026-02-08T09:15:00", "2026-02-07T14:00:00"],
  },
  {
    type: "priority_conflict",
    conflict_type: "resource allocation",
    decision1: "AI strategy requires dedicated ML team",
    decision2: "All engineers allocated to mobile app v3",
    times: ["2026-02-08T08:00:00", "2026-02-07T16:00:00"],
  },
];

export const mockOverloadData = [
  { person: "Alice Chen", messageVolume: 145, topicsTracked: 12, decisionsInvolved: 8, overloadScore: 0.87 },
  { person: "Bob Martinez", messageVolume: 120, topicsTracked: 9, decisionsInvolved: 6, overloadScore: 0.72 },
  { person: "Eve Johnson", messageVolume: 98, topicsTracked: 8, decisionsInvolved: 5, overloadScore: 0.65 },
  { person: "David Kim", messageVolume: 85, topicsTracked: 6, decisionsInvolved: 4, overloadScore: 0.52 },
  { person: "Carol Wu", messageVolume: 76, topicsTracked: 7, decisionsInvolved: 5, overloadScore: 0.48 },
  { person: "Frank Lee", messageVolume: 62, topicsTracked: 5, decisionsInvolved: 3, overloadScore: 0.38 },
  { person: "Grace Park", messageVolume: 45, topicsTracked: 4, decisionsInvolved: 2, overloadScore: 0.28 },
  { person: "Henry Davis", messageVolume: 38, topicsTracked: 3, decisionsInvolved: 2, overloadScore: 0.22 },
];

// ── Activity Timeline ────────────────────────────────────────
export const mockActivity: ActivityItem[] = [
  { id: "1", type: "decision", title: "Launch postponed", description: "Q4 product launch delayed 2 weeks for security fixes", timestamp: "2026-02-08T09:30:00", source: "Leadership sync" },
  { id: "2", type: "conflict", title: "Conflict detected", description: "Launch go/no-go contradiction between leadership decisions", timestamp: "2026-02-08T09:20:00" },
  { id: "3", type: "fact", title: "Security vulnerabilities", description: "3 critical auth module vulnerabilities found in audit", timestamp: "2026-02-08T08:45:00", source: "Security team" },
  { id: "4", type: "decision", title: "Hiring approved", description: "5 senior engineers approved for platform team", timestamp: "2026-02-08T08:30:00", source: "HR planning" },
  { id: "5", type: "topic", title: "AI cadence update", description: "AI strategy meetings moved to biweekly schedule", timestamp: "2026-02-08T08:00:00", source: "Product council" },
  { id: "6", type: "event", title: "Mobile milestone", description: "Mobile app v3 beta hit 10k downloads", timestamp: "2026-02-08T07:45:00", source: "Analytics" },
  { id: "7", type: "decision", title: "Design tokens adopted", description: "Component library switching to design token system", timestamp: "2026-02-07T17:30:00", source: "Design review" },
  { id: "8", type: "topic", title: "Partner API ready", description: "Partner integration requirements have been finalized", timestamp: "2026-02-07T16:00:00", source: "Partner meeting" },
];

// ── Query Examples ───────────────────────────────────────────
export const queryExamples = [
  { label: "What changed today?", category: "Memory" },
  { label: "Who needs to know about the security audit?", category: "Coordinator" },
  { label: "Context for alice@company.com", category: "Memory" },
  { label: "Are there any conflicts?", category: "Critic" },
  { label: "What is the current truth about the product launch?", category: "Memory" },
  { label: "Information overload for Bob Martinez", category: "Critic" },
];

// ── Mock Query Response ──────────────────────────────────────
export function getMockQueryResponse(query: string): QueryResponse {
  const q = query.toLowerCase();

  if (q.includes("changed") || q.includes("today")) {
    return {
      answer: "12 organizational changes detected in the last 24 hours. Key highlights: Q4 launch postponed 2 weeks due to security concerns, 5 senior engineer hires approved, and 3 critical vulnerabilities identified in the auth module.",
      changes: mockChanges.slice(0, 6),
      conflicts_found: 2,
      reasoning: "Scanned 102 truth entries and 45 graph edges. Identified 12 changes across 3 categories. Cross-referenced with conflict detection — found 2 potential contradictions requiring attention. Prioritized by recency and organizational impact.",
      orchestration: { query, agent_used: "Memory Agent", graph_nodes: 38, graph_edges: 45, truth_entries: 102 },
    };
  }

  if (q.includes("who needs") || q.includes("notify") || q.includes("know about")) {
    return {
      answer: "6 stakeholders should be notified about this topic. Alice Chen (VP Engineering) and Bob Martinez (Security Lead) have the highest centrality scores and are most critical to inform.",
      recommended_notifications: [
        { person: "alice@company.com", degree_centrality: 0.75, betweenness_centrality: 0.45, communication_volume: 25 },
        { person: "bob@company.com", degree_centrality: 0.68, betweenness_centrality: 0.38, communication_volume: 20 },
        { person: "eve@company.com", degree_centrality: 0.55, betweenness_centrality: 0.30, communication_volume: 15 },
        { person: "carol@company.com", degree_centrality: 0.48, betweenness_centrality: 0.22, communication_volume: 12 },
        { person: "david@company.com", degree_centrality: 0.42, betweenness_centrality: 0.18, communication_volume: 10 },
        { person: "frank@company.com", degree_centrality: 0.35, betweenness_centrality: 0.12, communication_volume: 8 },
      ],
      conflicts_found: 0,
      reasoning: "Analyzed network graph with 8 people nodes. Computed degree and betweenness centrality for all stakeholders. Filtered by topic relevance and communication volume. Ranked by combined centrality score.",
      orchestration: { query, agent_used: "Coordinator Agent", graph_nodes: 38, graph_edges: 45, truth_entries: 102 },
    };
  }

  if (q.includes("conflict") || q.includes("contradiction")) {
    return {
      answer: "4 conflicts detected in the last 48 hours. Most critical: direct contradiction between 'Proceed with Q4 launch' and 'Postpone Q4 launch by 2 weeks'. Additionally, resource allocation conflicts between AI strategy and mobile app priorities.",
      conflicts_found: 4,
      reasoning: "Cross-referenced 13 decisions and 17 topics. Applied contradiction detection on temporal decision pairs. Found 2 direct contradictions and 2 priority conflicts. Severity ranked by organizational impact and stakeholder count.",
      orchestration: { query, agent_used: "Critic Agent", graph_nodes: 38, graph_edges: 45, truth_entries: 102 },
    };
  }

  // Default context response
  return {
    answer: "Based on current organizational knowledge: 38 entities tracked across 8 people, 17 topics, and 13 decisions. The network shows 45 active connections with a density of 0.032. Key areas of focus include the Q4 launch timeline, security audit outcomes, and engineering hiring.",
    results: [],
    conflicts_found: 0,
    reasoning: "Performed broad knowledge graph scan. Aggregated statistics from all node types and edge connections. Identified top themes by connection density and recent activity volume.",
    orchestration: { query, agent_used: "Memory Agent", graph_nodes: 38, graph_edges: 45, truth_entries: 102 },
  };
}
