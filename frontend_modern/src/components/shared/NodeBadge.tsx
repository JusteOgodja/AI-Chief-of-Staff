import type { NodeType } from "@/lib/types";

interface NodeBadgeProps {
  type: NodeType;
  size?: "sm" | "md";
}

const config = {
  person: { label: "Person", className: "node-person" },
  topic: { label: "Topic", className: "node-topic" },
  decision: { label: "Decision", className: "node-decision" },
};

export default function NodeBadge({ type, size = "sm" }: NodeBadgeProps) {
  const c = config[type];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${c.className} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {c.label}
    </span>
  );
}
