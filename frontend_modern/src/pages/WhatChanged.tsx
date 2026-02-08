import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarClock, GitBranch, Lightbulb, FileText, Clock, Filter, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/shared/MetricCard";
import NodeBadge from "@/components/shared/NodeBadge";
import { apiClient } from "@/lib/api";

type TypeFilter = "all" | "decision" | "topic" | "fact";

const typeIcons = {
  decision: GitBranch,
  topic: Lightbulb,
  fact: FileText,
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WhatChanged() {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [changes, setChanges] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChanges = async () => {
      try {
        const data = await apiClient.getChanges(24);
        setChanges(data);
      } catch (error) {
        console.error('Failed to load changes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChanges();
  }, []);

  const filtered = (changes?.changes || []).filter((c) => {
    if (filter !== "all" && c.type !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return c.content.toLowerCase().includes(s) || c.source.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">What Changed</h1>
            <p className="text-sm text-muted-foreground">
              Real-time tracking of organizational changes — last 48 hours.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Changes"
            value={changes?.summary?.total_changes || 0}
            icon={CalendarClock}
            variant="primary"
            trend={{ value: 12, label: "vs yesterday" }}
            delay={0}
          />
          <MetricCard
            title="New Decisions"
            value={changes?.summary?.new_decisions || 0}
            icon={GitBranch}
            variant="warning"
            trend={{ value: 3, label: "this week" }}
            delay={0.05}
          />
          <MetricCard
            title="New Topics"
            value={changes?.summary?.new_topics || 0}
            icon={Lightbulb}
            variant="accent"
            trend={{ value: 8, label: "this week" }}
            delay={0.1}
          />
          <MetricCard
            title="New Facts"
            value={changes?.summary?.new_facts || 0}
            icon={FileText}
            variant="primary"
            trend={{ value: 5, label: "this week" }}
            delay={0.15}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "decision", "topic", "fact"] as TypeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "decision" ? "Decisions" : f === "topic" ? "Topics" : "Facts"}
              {f !== "all" && (
                <span className="ml-1 opacity-60">
                  ({(changes?.changes || []).filter((c) => c.type === f).length})
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Timeline */}
        <div className="glass-card rounded-xl">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Timeline</h2>
          </div>
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No changes match your criteria.
              </div>
            )}
            {filtered.map((change, i) => {
              const Icon = typeIcons[change.type];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  {/* Time */}
                  <div className="w-36 shrink-0 pt-0.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatTimestamp(change.timestamp)}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        change.type === "decision"
                          ? "bg-warning/10"
                          : change.type === "topic"
                          ? "bg-accent/10"
                          : "bg-primary/10"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          change.type === "decision"
                            ? "text-warning"
                            : change.type === "topic"
                            ? "text-accent"
                            : "text-primary"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <NodeBadge type={change.type === "fact" ? "person" : change.type} />
                      <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        v{change.version}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{change.content}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Source: {change.source}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
