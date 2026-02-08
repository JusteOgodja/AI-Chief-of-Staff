import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertOctagon,
  Users,
  HelpCircle,
  ArrowRightLeft,
  TrendingUp,
  Filter,
  Clock,
  ShieldAlert,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/shared/MetricCard";
import { apiClient } from "@/lib/api";

type SeverityFilter = "all" | "decision_contradiction" | "information_conflict" | "priority_conflict";
type OverloadFilter = "all" | "high" | "medium" | "low";

const severityColors = {
  decision_contradiction: { bg: "bg-destructive/10", text: "text-destructive", label: "Contradiction", icon: AlertOctagon },
  information_conflict: { bg: "bg-warning/10", text: "text-warning", label: "Info Conflict", icon: AlertTriangle },
  priority_conflict: { bg: "bg-primary/10", text: "text-primary", label: "Priority", icon: ShieldAlert },
};

function getOverloadColor(score: number) {
  if (score >= 0.7) return "bg-destructive";
  if (score >= 0.5) return "bg-warning";
  return "bg-accent";
}

function getOverloadLabel(score: number) {
  if (score >= 0.7) return "High";
  if (score >= 0.5) return "Medium";
  return "Low";
}

export default function Conflicts() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [overloadData, setOverloadData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [conflictsData, overloadResponse] = await Promise.all([
          apiClient.detectConflicts(),
          apiClient.checkOverload('phillip.allen@enron.com')
        ]);
        setConflicts(conflictsData.conflicts || []);
        setOverloadData([overloadResponse]); // Convert single object to array for compatibility
      } catch (error) {
        console.error('Failed to load conflicts data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [overloadFilter, setOverloadFilter] = useState<OverloadFilter>("all");

  const filteredConflicts = severityFilter === "all"
    ? conflicts
    : conflicts.filter((c) => c.type === severityFilter);

  const filteredOverload = overloadFilter === "all"
    ? overloadData
    : overloadData.filter((d) => {
        const score = d.is_overloaded ? 0.8 : 0.2; // Simulate overload score based on is_overloaded
        if (overloadFilter === "high") return score >= 0.7;
        if (overloadFilter === "medium") return score >= 0.5 && score < 0.7;
        return score < 0.5;
      });

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conflicts & Alerts</h1>
            <p className="text-sm text-muted-foreground">
              Automatic detection of contradictions, information overload, and organizational gaps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {conflicts.length} active conflicts
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-warning/20 bg-warning/5 px-3 py-1.5 text-xs font-medium text-warning">
              <Users className="h-3 w-3" />
              {overloadData.filter((d) => d.is_overloaded).length} overloaded
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Conflicts"
            value={conflicts.length}
            icon={AlertTriangle}
            variant="danger"
            trend={{ value: 25, label: "vs yesterday" }}
          />
          <MetricCard
            title="People at Risk"
            value={overloadData.filter((d) => d.is_overloaded).length}
            icon={Users}
            variant="warning"
            subtitle="Information overload"
          />
          <MetricCard
            title="Contradictions"
            value={conflicts.filter((c) => c.type === "decision_contradiction").length}
            icon={ArrowRightLeft}
            variant="danger"
            trend={{ value: -10, label: "this week" }}
          />
          <MetricCard
            title="Knowledge Gaps"
            value={3}
            icon={HelpCircle}
            variant="primary"
            subtitle="Topics need coverage"
            delay={0.15}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Conflicts */}
          <div className="glass-card rounded-xl">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <AlertOctagon className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-semibold text-foreground">Detected Conflicts</h2>
              <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {filteredConflicts.length}
              </span>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 border-b border-border px-5 py-2.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              {(["all", "decision_contradiction", "information_conflict", "priority_conflict"] as SeverityFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                    severityFilter === f
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "decision_contradiction" ? "Contradictions" : f === "information_conflict" ? "Info" : "Priority"}
                </button>
              ))}
            </div>

            <div className="divide-y divide-border">
              {filteredConflicts.map((conflict, i) => {
                const severity = severityColors[conflict.type as keyof typeof severityColors] || severityColors.information_conflict;
                const SevIcon = severity.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-2">
                      <SevIcon className={`h-3.5 w-3.5 ${severity.text}`} />
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severity.bg} ${severity.text}`}>
                        {severity.label}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {conflict.conflict_type}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Unresolved
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-lg border border-border bg-card/50 p-3">
                        <p className="text-xs text-foreground">{conflict.decision1}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(conflict.times[0]).toLocaleString("en-US")}
                        </p>
                      </div>
                      <ArrowRightLeft className="h-4 w-4 shrink-0 text-destructive" />
                      <div className="flex-1 rounded-lg border border-border bg-card/50 p-3">
                        <p className="text-xs text-foreground">{conflict.decision2}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(conflict.times[1]).toLocaleString("en-US")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Overload */}
          <div className="glass-card rounded-xl">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <TrendingUp className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Information Overload</h2>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 border-b border-border px-5 py-2.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              {(["all", "high", "medium", "low"] as OverloadFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOverloadFilter(f)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                    overloadFilter === f
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "high" ? "High" : f === "medium" ? "Medium" : "Low"}
                </button>
              ))}
            </div>

            <div className="divide-y divide-border">
              {filteredOverload.map((person, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-semibold text-primary">
                      {person.person?.split(" ").map((n) => n[0]).join("") || "User"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{person.person || "Unknown User"}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          person.is_overloaded
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {person.is_overloaded ? "High" : "Normal"}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          person.is_overloaded ? "bg-destructive" : "bg-accent"
                        }`}
                        style={{ width: "20%" }}
                      />
                    </div>
                    <div className="mt-1.5 flex gap-4 text-[10px] text-muted-foreground">
                      <span>{person.relevant_changes || 0} messages</span>
                      <span>{person.breakdown?.decisions || 0} topics</span>
                      <span>{person.breakdown?.topics || 0} decisions</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div className="glass-card rounded-xl">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Knowledge Gaps</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">
              Topics requiring special attention
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            {[
              { topic: "Compliance Review", gap: "No stakeholder assigned", coverage: 25, priority: "Critical" },
              { topic: "Data Pipeline", gap: "Missing tooling decision", coverage: 40, priority: "High" },
              { topic: "Performance Review Cycle", gap: "Timeline undefined", coverage: 35, priority: "Medium" },
            ].map((g, i) => (
              <motion.div
                key={g.topic}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{g.topic}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      g.priority === "Critical"
                        ? "bg-destructive/10 text-destructive"
                        : g.priority === "High"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {g.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{g.gap}</p>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Coverage</span>
                    <span className="text-[11px] font-medium text-foreground">{g.coverage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full gradient-primary"
                      style={{ width: `${g.coverage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
