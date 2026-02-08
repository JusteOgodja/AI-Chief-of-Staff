import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Network,
  Brain,
  CalendarClock,
  AlertTriangle,
  ChevronLeft,
  Zap,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/graph", icon: Network, label: "Knowledge Graph" },
  { to: "/agent", icon: Brain, label: "AI Agent" },
  { to: "/changes", icon: CalendarClock, label: "What Changed" },
  { to: "/conflicts", icon: AlertTriangle, label: "Conflicts & Alerts" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col overflow-hidden"
          >
            <span className="text-sm font-semibold text-sidebar-primary-foreground whitespace-nowrap">
              AI Chief of Staff
            </span>
            <span className="text-[11px] text-sidebar-foreground/60 whitespace-nowrap">
              Organizational Intelligence
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon className={`relative z-10 h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && (
                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                  transition={{ duration: 0.2 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary-foreground"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </motion.aside>
  );
}
