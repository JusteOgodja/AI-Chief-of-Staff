import { useLocation } from "react-router-dom";
import { Bell, Search, Settings, ChevronRight, Home } from "lucide-react";
import { useState } from "react";

const routeNames: Record<string, { label: string; description: string }> = {
  "/": { label: "Dashboard", description: "Overview of your organization" },
  "/graph": { label: "Knowledge Graph", description: "Organizational relationship mapping" },
  "/agent": { label: "AI Agent", description: "Intelligent query interface" },
  "/changes": { label: "What Changed", description: "Organizational change tracking" },
  "/conflicts": { label: "Conflicts & Alerts", description: "Contradiction and overload detection" },
};

export default function TopBar() {
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || { label: "Page", description: "" };
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-6">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-sm">
          <Home className="h-3.5 w-3.5 text-muted-foreground" />
          {location.pathname !== "/" && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className="font-medium text-foreground">{currentRoute.label}</span>
            </>
          )}
          {location.pathname === "/" && (
            <span className="font-medium text-foreground">Dashboard</span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="h-8 w-56 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                onBlur={() => setShowSearch(false)}
                onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* Settings */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Settings className="h-4 w-4" />
        </button>

        {/* Separator */}
        <div className="mx-2 h-6 w-px bg-border" />

        {/* User Avatar */}
        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
            JD
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">John Doe</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Chief of Operations</p>
          </div>
        </button>
      </div>
    </header>
  );
}
