import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  Lightbulb,
  GitBranch,
  Database,
  ArrowRight,
  Brain,
  Network,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/shared/MetricCard";
import QueryInput from "@/components/shared/QueryInput";
import ActivityTimeline from "@/components/shared/ActivityTimeline";
import { apiClient, type GraphStats } from "@/lib/api";

const quickActions = [
  { label: "Knowledge Graph", icon: Network, to: "/graph", desc: "Explore relationships" },
  { label: "AI Agent", icon: Brain, to: "/agent", desc: "Ask a question" },
  { label: "Conflicts", icon: AlertTriangle, to: "/conflicts", desc: "4 active alerts" },
  { label: "What Changed", icon: Clock, to: "/changes", desc: "12 recent changes" },
];

const activityChartData = [
  { name: "Mon", decisions: 2, topics: 4, facts: 3 },
  { name: "Tue", decisions: 1, topics: 3, facts: 5 },
  { name: "Wed", decisions: 3, topics: 2, facts: 2 },
  { name: "Thu", decisions: 0, topics: 5, facts: 4 },
  { name: "Fri", decisions: 4, topics: 3, facts: 1 },
  { name: "Sat", decisions: 1, topics: 1, facts: 2 },
  { name: "Sun", decisions: 3, topics: 5, facts: 4 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const statusItems = [
  { label: "AI System", status: "operational", icon: Brain },
  { label: "Knowledge Graph", status: "operational", icon: Network },
  { label: "Conflict Detection", status: "warning", icon: Shield },
  { label: "Data Sync", status: "operational", icon: Activity },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [graphStats, setGraphStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await apiClient.getGraphStats();
        setGraphStats(stats);
      } catch (error) {
        console.error('Failed to load graph stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleQuery = (query: string) => {
    navigate("/agent", { state: { query } });
  };

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {getGreeting()}, John
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's what's happening across your organization today,{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              .
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {statusItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5"
                title={item.label}
              >
                <item.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    item.status === "operational" ? "bg-accent" : "bg-warning"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="People"
          value={graphStats?.people_count || 0}
          icon={Users}
          variant="primary"
          trend={{ value: 12, label: "this month" }}
          delay={0}
        />
        <MetricCard
          title="Active Topics"
          value={graphStats?.topics_count || 0}
          icon={Lightbulb}
          variant="accent"
          trend={{ value: 8, label: "this week" }}
          delay={0.05}
        />
        <MetricCard
          title="Decisions"
          value={graphStats?.decisions_count || 0}
          icon={GitBranch}
          variant="warning"
          trend={{ value: -3, label: "vs last week" }}
          delay={0.1}
        />
        <MetricCard
          title="Truth Entries"
          value={graphStats?.total_nodes || 0}
          icon={Database}
          variant="primary"
          trend={{ value: 15, label: "versioned entries" }}
          delay={0.15}
        />
      </div>

      {/* Query Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <QueryInput
          onSubmit={handleQuery}
          large
          placeholder="Ask anything about your organization..."
          suggestions={[
            "What changed today?",
            "Who needs to know about the security audit?",
            "Are there any conflicts?",
          ]}
        />
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <div className="glass-card rounded-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Organizational Activity</h2>
                <p className="text-[11px] text-muted-foreground">Decisions, topics and facts — last 7 days</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Decisions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-[10px] text-muted-foreground">Topics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span className="text-[10px] text-muted-foreground">Facts</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activityChartData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 32%, 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar dataKey="decisions" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Decisions" />
                  <Bar dataKey="topics" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Topics" />
                  <Bar dataKey="facts" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Facts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.to}
                  onClick={() => navigate(action.to)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Network Health */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Network Health</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Graph Density</span>
                <span className="text-sm font-semibold text-foreground">
                  {((graphStats?.density || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full gradient-primary transition-all"
                  style={{ width: `${(graphStats?.density || 0) * 100 * 10}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Connections</span>
                <span className="text-sm font-semibold text-foreground">{graphStats?.total_edges || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Conflicts</span>
                <span className="text-sm font-semibold text-destructive">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Coverage Score</span>
                <span className="text-sm font-semibold text-accent">78%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6"
      >
        <div className="glass-card rounded-xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              <p className="text-[11px] text-muted-foreground">Last 24 hours</p>
            </div>
            <button
              onClick={() => navigate("/changes")}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-2">
            <ActivityTimeline items={[]} />
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
