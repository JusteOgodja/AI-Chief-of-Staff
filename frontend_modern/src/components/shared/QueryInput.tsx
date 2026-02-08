import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight } from "lucide-react";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  large?: boolean;
}

export default function QueryInput({
  onSubmit,
  placeholder = "Ask anything about your organization...",
  suggestions = [],
  large = false,
}: QueryInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 focus-within:border-primary/50 focus-within:glow ${large ? "shadow-lg" : ""}`}>
          <div className="flex items-center gap-3 px-4">
            <Sparkles className={`shrink-0 text-primary ${large ? "h-5 w-5" : "h-4 w-4"}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none ${large ? "py-5 text-lg" : "py-3.5 text-sm"}`}
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium gradient-primary text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <Search className="h-4 w-4" />
              {large && <span>Ask</span>}
            </button>
          </div>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSubmit(s)}
              className="group flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              <span>{s}</span>
              <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
