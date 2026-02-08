// Types for the AI Chief of Staff system

export type NodeType = "person" | "topic" | "decision";

export interface GraphNode {
  id: string;
  node_type: NodeType;
  label: string;
  connections: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  edge_type: "communicates_with" | "mentions_topic" | "decided_on";
  weight: number;
}

export interface GraphStats {
  total_nodes: number;
  people_nodes: number;
  topic_nodes: number;
  decision_nodes: number;
  total_edges: number;
  network_density: number;
}

export interface TruthEntry {
  id: string;
  content: string;
  entity_type: "decision" | "topic" | "fact";
  timestamp: string;
  source_event_id: string;
  version: number;
  previous_version_id: string | null;
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface ChangeItem {
  type: "decision" | "topic" | "fact";
  content: string;
  timestamp: string;
  source: string;
  version: number;
}

export interface ChangeSummary {
  total_changes: number;
  new_decisions: number;
  new_topics: number;
  new_facts: number;
}

export interface Notification {
  person: string;
  degree_centrality: number;
  betweenness_centrality: number;
  communication_volume: number;
}

export interface Conflict {
  type: string;
  conflict_type: string;
  decision1: string;
  decision2: string;
  times: string[];
}

export interface OrchestrationInfo {
  query: string;
  agent_used: string;
  graph_nodes: number;
  graph_edges: number;
  truth_entries: number;
}

export interface QueryResponse {
  answer: string;
  results?: TruthEntry[];
  changes?: ChangeItem[];
  recommended_notifications?: Notification[];
  conflicts_found: number;
  reasoning: string;
  orchestration: OrchestrationInfo;
}

export interface ActivityItem {
  id: string;
  type: "decision" | "topic" | "fact" | "event" | "conflict";
  title: string;
  description: string;
  timestamp: string;
  source?: string;
}
