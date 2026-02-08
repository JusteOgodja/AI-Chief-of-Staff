import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Cpu,
  Lightbulb,
  User,
  Bell,
  Sparkles,
  MessageSquare,
  Clock,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import QueryInput from "@/components/shared/QueryInput";
import CollapsibleSection from "@/components/shared/CollapsibleSection";
import NodeBadge from "@/components/shared/NodeBadge";
import { queryExamples } from "@/lib/mock-data";
import { apiClient, type QueryResponse } from "@/lib/api";

export default function AgentInterface() {
  const location = useLocation();
  const initialQuery = (location.state as { query?: string } | null)?.query;
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [currentQuery, setCurrentQuery] = useState(initialQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>(
    initialQuery ? [initialQuery] : []
  );

  const handleQuery = async (query: string) => {
    setCurrentQuery(query);
    setIsLoading(true);
    setError(null);
    setQueryHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 10));
    
    try {
      const apiResponse = await apiClient.processQuery({ query });
      setResponse(apiResponse);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process query');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Agent</h1>
            <p className="text-sm text-muted-foreground">
              Ask questions in natural language — the orchestrator routes to the right agent.
            </p>
          </div>
          {queryHistory.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{queryHistory.length} recent quer{queryHistory.length > 1 ? "ies" : "y"}</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <QueryInput
          onSubmit={handleQuery}
          large
          placeholder="What do you want to know about your organization?"
          suggestions={queryExamples.map((e) => e.label)}
        />

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Error</span>
            </div>
            <p className="mt-1 text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary animate-pulse">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Processing...</p>
              <p className="text-xs text-muted-foreground">Querying the knowledge graph and specialized agents</p>
            </div>
          </motion.div>
        )}

        {/* Response */}
        {response && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Answer */}
            <div className="glass-card rounded-xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {response.orchestration.agent_used}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {response.orchestration.graph_nodes} nodes · {response.orchestration.graph_edges} edges · {response.orchestration.truth_entries} entries
                  </p>
                </div>
                {currentQuery && (
                  <div className="ml-auto hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 sm:flex">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground max-w-xs truncate">
                      {currentQuery}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground">{response.answer}</p>
              {response.conflicts_found > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                  <Sparkles className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-medium text-destructive">
                    {response.conflicts_found} conflict{response.conflicts_found > 1 ? "s" : ""} detected
                  </span>
                </div>
              )}
            </div>

            {/* Results - Decisions and Topics */}
            {response.results && response.results.length > 0 && (
              <CollapsibleSection
                title="Results"
                badge={response.results.length}
                defaultOpen
                icon={<Lightbulb className="h-4 w-4 text-primary" />}
              >
                <div className="space-y-2">
                  {response.results.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                      <NodeBadge type={r.type === "decision" ? "decision" : r.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{r.content}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>Type: {r.type}</span>
                          <span>·</span>
                          <span>{new Date(r.timestamp).toLocaleString("en-US")}</span>
                          {r.version && (
                            <>
                              <span>·</span>
                              <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px]">v{r.version}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Changes */}
            {response.changes && response.changes.length > 0 && (
              <CollapsibleSection
                title="Detailed Changes"
                badge={response.changes.length}
                defaultOpen
                icon={<Lightbulb className="h-4 w-4 text-accent" />}
              >
                <div className="space-y-2">
                  {response.changes.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                      <NodeBadge type={c.type === "fact" ? "person" : c.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{c.content}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{new Date(c.timestamp).toLocaleString("en-US")}</span>
                          <span>·</span>
                          <span>{c.source}</span>
                          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px]">v{c.version}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Notifications */}
            {response.recommended_notifications && response.recommended_notifications.length > 0 && (
              <CollapsibleSection
                title="Recommended Notifications"
                badge={response.recommended_notifications.length}
                defaultOpen
                icon={<Bell className="h-4 w-4 text-warning" />}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {response.recommended_notifications.map((n, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-semibold text-primary">
                          {n.person.split("@")[0].slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{n.person}</p>
                        <div className="flex gap-3 text-[11px] text-muted-foreground">
                          <span>Centrality: {(n.degree_centrality * 100).toFixed(0)}%</span>
                          <span>Volume: {n.communication_volume}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {(n.degree_centrality * 100).toFixed(0)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* AI Reasoning */}
            <CollapsibleSection
              title="AI Reasoning"
              icon={<Lightbulb className="h-4 w-4 text-primary" />}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                {response.reasoning}
              </p>
            </CollapsibleSection>

            {/* Orchestration Details */}
            <CollapsibleSection
              title="Orchestration Details"
              icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Agent Used", value: response.orchestration.agent_used },
                  { label: "Graph Nodes", value: response.orchestration.graph_nodes },
                  { label: "Graph Edges", value: response.orchestration.graph_edges },
                  { label: "Truth Entries", value: response.orchestration.truth_entries },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-card/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </motion.div>
        )}

        {/* Empty state */}
        {!response && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="py-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-pulse-glow">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Ask the AI Chief of Staff</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Type a question above to get intelligent, grounded answers about your organization.
            </p>

            {/* Agent Cards */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { agent: "Memory Agent", desc: "What happened, what's true", color: "text-primary", icon: Brain },
                  { agent: "Coordinator Agent", desc: "Who should know what", color: "text-accent", icon: User },
                  { agent: "Critic Agent", desc: "Conflicts & overload", color: "text-destructive", icon: Sparkles },
                ].map((a) => (
                  <div key={a.agent} className="glass-card rounded-xl p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <a.icon className={`h-4 w-4 ${a.color}`} />
                      <p className={`text-sm font-semibold ${a.color}`}>{a.agent}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent queries */}
            {queryHistory.length > 0 && (
              <div className="mx-auto mt-6 max-w-md">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Recent queries</p>
                <div className="space-y-1.5">
                  {queryHistory.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuery(q)}
                      className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 text-xs text-foreground transition-all hover:border-primary/30 hover:bg-muted/50"
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
