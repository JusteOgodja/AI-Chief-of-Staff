import { motion } from "framer-motion";
import {
  GitBranch,
  Lightbulb,
  AlertTriangle,
  Activity,
  FileText,
} from "lucide-react";
import type { ActivityItem } from "@/lib/types";

const typeConfig = {
  decision: { icon: GitBranch, color: "text-warning", bg: "bg-warning/10", label: "Decision" },
  topic: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10", label: "Topic" },
  fact: { icon: FileText, color: "text-primary", bg: "bg-primary/10", label: "Fact" },
  event: { icon: Activity, color: "text-muted-foreground", bg: "bg-muted", label: "Event" },
  conflict: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Conflict" },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  maxItems?: number;
}

export default function ActivityTimeline({ items, maxItems = 8 }: ActivityTimelineProps) {
  const displayed = items.slice(0, maxItems);

  return (
    <div className="space-y-1">
      {displayed.map((item, i) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="group relative flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            {/* Connector line */}
            {i < displayed.length - 1 && (
              <div className="absolute left-[27px] top-12 h-[calc(100%-24px)] w-px bg-border" />
            )}

            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/70">
                <span>{formatTime(item.timestamp)}</span>
                {item.source && (
                  <>
                    <span>·</span>
                    <span>{item.source}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
