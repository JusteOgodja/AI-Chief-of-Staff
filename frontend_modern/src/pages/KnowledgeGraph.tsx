import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ZoomIn, ZoomOut, Maximize2, Filter } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import NodeBadge from "@/components/shared/NodeBadge";
import type { GraphNode, NodeType } from "@/lib/types";

type FilterType = "all" | NodeType;

// Simple force-layout positions (pre-computed-ish with some variation)
function layoutNodes(nodes: any[], width: number, height: number): (any & { x: number; y: number })[] {
  const cx = width / 2;
  const cy = height / 2;
  const people = nodes.filter((n) => n.type === "person");
  const topics = nodes.filter((n) => n.type === "topic");
  const decisions = nodes.filter((n) => n.type === "decision");

  const placeCircle = (items: any[], radius: number, offset: number) =>
    items.map((n, i) => {
      const angle = (2 * Math.PI * i) / items.length + offset;
      return { ...n, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });

  return [
    ...placeCircle(people, Math.min(width, height) * 0.18, 0),
    ...placeCircle(topics, Math.min(width, height) * 0.34, Math.PI / 17),
    ...placeCircle(decisions, Math.min(width, height) * 0.26, Math.PI / 7),
  ];
}

const nodeColors: Record<NodeType, string> = {
  person: "hsl(217, 91%, 60%)",
  topic: "hsl(160, 84%, 39%)",
  decision: "hsl(38, 92%, 50%)",
};

const nodeColorsLight: Record<NodeType, string> = {
  person: "hsl(217, 91%, 60%, 0.15)",
  topic: "hsl(160, 84%, 39%, 0.15)",
  decision: "hsl(38, 92%, 50%, 0.15)",
};

export default function KnowledgeGraph() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [graphStats, setGraphStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, nodesData] = await Promise.all([
          fetch('http://localhost:8000/api/graph/stats').then(r => r.json()),
          fetch('http://localhost:8000/api/graph/nodes?limit=100').then(r => r.json())
        ]);
        setGraphStats(statsData);
        setNodes(nodesData.nodes || []);
        setEdges([]); // We'll implement edges API later
      } catch (error) {
        console.error('Failed to load graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.max(600, width), height: Math.max(400, height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filteredNodes = useMemo(() => {
    let filteredNodes = nodes;
    if (filter !== "all") filteredNodes = filteredNodes.filter((n) => n.type === filter);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter((n) => n.id.toLowerCase().includes(s));
    }
    return filteredNodes;
  }, [nodes, filter, searchTerm]);

  const positioned = useMemo(
    () => layoutNodes(filteredNodes, dimensions.width, dimensions.height),
    [filteredNodes, dimensions]
  );

  const posMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    positioned.forEach((n) => m.set(n.id, { x: n.x, y: n.y }));
    return m;
  }, [positioned]);

  const visibleEdges = useMemo(
    () => edges.filter((e) => posMap.has(e.source) && posMap.has(e.target)),
    [posMap, edges]
  );

  const nodeConnections = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
      .map((e) => {
        const otherId = e.source === selectedNode.id ? e.target : e.source;
        const other = nodes.find((n) => n.id === otherId);
        return { edge: e, node: other };
      })
      .filter((c) => c.node);
  }, [selectedNode]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge Graph</h1>
            <p className="text-sm text-muted-foreground">
              {graphStats?.total_nodes || 0} nodes · {graphStats?.total_edges || 0} edges · {((graphStats?.density || 0) * 100).toFixed(1)}% density
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "person", "topic", "decision"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "gradient-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All Types" : f}
              {f !== "all" && (
                <span className="ml-1.5 opacity-70">
                  ({nodes.filter((n) => n.type === f).length})
                </span>
              )}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => setZoom(1)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Graph + Detail */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div ref={containerRef} className="glass-card overflow-hidden rounded-xl lg:col-span-2" style={{ minHeight: 500 }}>
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="w-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {/* Edges */}
              {visibleEdges.map((e, i) => {
                const s = posMap.get(e.source)!;
                const t = posMap.get(e.target)!;
                const isHighlighted = selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id);
                return (
                  <line
                    key={i}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={isHighlighted ? "hsl(217, 91%, 60%)" : "hsl(215, 16%, 47%, 0.2)"}
                    strokeWidth={isHighlighted ? Math.max(1.5, e.weight / 8) : Math.max(0.5, e.weight / 15)}
                    strokeOpacity={selectedNode ? (isHighlighted ? 0.8 : 0.1) : 0.3}
                  />
                );
              })}

              {/* Nodes */}
              {positioned.map((node) => {
                const r = Math.max(8, Math.min(20, node.connections * 1.5));
                const isSelected = selectedNode?.id === node.id;
                const isDimmed = selectedNode && !isSelected && !nodeConnections.some((c) => c.node?.id === node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className="cursor-pointer"
                    opacity={isDimmed ? 0.2 : 1}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 4}
                      fill={nodeColorsLight[node.type]}
                      className="transition-all duration-200"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={nodeColors[node.type]}
                      stroke={isSelected ? "white" : "transparent"}
                      strokeWidth={isSelected ? 2 : 0}
                      className="transition-all duration-200"
                    />
                    <text
                      x={node.x}
                      y={node.y + r + 14}
                      textAnchor="middle"
                      className="fill-foreground text-[10px] font-medium pointer-events-none"
                    >
                      {node.label.length > 18 ? node.label.slice(0, 16) + "…" : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Detail Panel */}
          <div className="space-y-4">
            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-xl p-5 space-y-4"
              >
                <div className="space-y-2">
                  <NodeBadge type={selectedNode.type} size="md" />
                  <h3 className="text-lg font-semibold text-foreground">{selectedNode.label}</h3>
                  <p className="text-xs text-muted-foreground">{selectedNode.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Connections</p>
                    <p className="text-xl font-bold text-foreground">{selectedNode.connections}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Edges</p>
                    <p className="text-xl font-bold text-foreground">{nodeConnections.length}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Connected To
                  </h4>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {nodeConnections.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedNode(c.node!)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50"
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: nodeColors[c.node!.type] }}
                        />
                        <span className="flex-1 truncate text-sm text-foreground">{c.node!.label}</span>
                        <span className="text-[10px] text-muted-foreground">{c.edge.edge_type.replace(/_/g, " ")}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-sm text-muted-foreground">Click a node to explore its connections</p>
              </div>
            )}

            {/* Stats */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Graph Statistics</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Total Nodes", value: graphStats?.total_nodes || 0 },
                  { label: "People", value: graphStats?.people_count || 0, color: nodeColors.person },
                  { label: "Topics", value: graphStats?.topics_count || 0, color: nodeColors.topic },
                  { label: "Decisions", value: graphStats?.decisions_count || 0, color: nodeColors.decision },
                  { label: "Total Edges", value: graphStats?.total_edges || 0 },
                  { label: "Network Density", value: `${((graphStats?.density || 0) * 100).toFixed(1)}%` },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stat.color && (
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color }} />
                      )}
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
