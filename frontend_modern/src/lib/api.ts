/**
 * API client for AI Chief of Staff backend
 * Connects frontend to FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

export interface QueryRequest {
  query: string;
  context?: Record<string, any>;
}

export interface QueryResponse {
  answer: string;
  results?: Array<{
    content: string;
    source: string;
    confidence?: string;
  }>;
  changes?: Array<{
    type: string;
    content: string;
    timestamp: string;
    source: string;
    version: number;
  }>;
  recommended_notifications?: Array<{
    person: string;
    degree_centrality: number;
    communication_volume?: number;
  }>;
  reasoning?: string;
  orchestration?: {
    agent_used: string;
    graph_nodes: number;
    graph_edges: number;
    truth_entries: number;
  };
  conflicts_found: number;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  people_count: number;
  topics_count: number;
  decisions_count: number;
  density: number;
}

export interface NodeInfo {
  id: string;
  type: string;
  label: string;
  connections: number;
}

export interface NodesResponse {
  nodes: NodeInfo[];
  total_count: number;
}

export interface ChangesResponse {
  summary: {
    total_changes: number;
    new_decisions: number;
    new_topics: number;
    new_facts: number;
  };
  changes: Array<{
    type: string;
    content: string;
    timestamp: string;
    source: string;
    version: number;
  }>;
}

export interface ConflictsResponse {
  conflicts_found: number;
  conflicts: Array<{
    conflict_type: string;
    decision1?: string;
    decision2?: string;
    topic1?: string;
    topic2?: string;
  }>;
}

export interface OverloadResponse {
  is_overloaded: boolean;
  relevant_changes: number;
  threshold: number;
  breakdown: {
    decisions: number;
    topics: number;
    other: number;
  };
  recommendation: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Query endpoint
  async processQuery(request: QueryRequest): Promise<QueryResponse> {
    return this.request<QueryResponse>('/api/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Graph statistics
  async getGraphStats(): Promise<GraphStats> {
    return this.request<GraphStats>('/api/graph/stats');
  }

  // Get nodes
  async getNodes(nodeType?: string, limit: number = 50): Promise<NodesResponse> {
    const params = new URLSearchParams();
    if (nodeType && nodeType !== 'all') {
      params.append('node_type', nodeType);
    }
    params.append('limit', limit.toString());
    
    const endpoint = `/api/graph/nodes?${params.toString()}`;
    return this.request<NodesResponse>(endpoint);
  }

  // Get recent changes
  async getChanges(hours: number = 24): Promise<ChangesResponse> {
    return this.request<ChangesResponse>(`/api/changes?hours=${hours}`);
  }

  // Detect conflicts
  async detectConflicts(): Promise<ConflictsResponse> {
    return this.request<ConflictsResponse>('/api/conflicts/detect', {
      method: 'POST',
    });
  }

  // Check information overload
  async checkOverload(personEmail: string): Promise<OverloadResponse> {
    return this.request<OverloadResponse>(`/api/overload/${encodeURIComponent(personEmail)}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; graph_nodes: number; truth_entries: number }> {
    return this.request('/api/health');
  }

  // Get API info
  async getApiInfo(): Promise<any> {
    return this.request('/');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  QueryRequest,
  QueryResponse,
  GraphStats,
  NodeInfo,
  NodesResponse,
  ChangesResponse,
  ConflictsResponse,
  OverloadResponse,
};

export default apiClient;
