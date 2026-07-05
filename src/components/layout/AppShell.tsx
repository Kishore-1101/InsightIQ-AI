import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, MessageSquareText, Upload, BrainCircuit,
  MessageCircle, Settings, Menu, ChevronLeft, ChevronRight,
  Sun, Moon, Bell, LogOut, Sparkles, Database, Search, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  avatarUrl?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  reviewCount: number;
  user?: UserProfile;
}

export default function AppShell({ children, activeView, setActiveView, reviewCount, user }: AppShellProps) {
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "reviews", label: "Reviews Data", icon: MessageSquareText },
    { id: "upload", label: "Import Center", icon: Upload },
    { id: "insights", label: "AI Insights", icon: BrainCircuit, badge: "AI" },
    { id: "chat", label: "AI Chat Assistant", icon: MessageCircle },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const viewTitles: Record<string, string> = {
    dashboard: "Enterprise Dashboard",
    reviews: "Customer Reviews Explorer",
    upload: "Data Import Center",
    insights: "AI Strategic Insights",
    chat: "ReviewLens AI Chat",
    profile: "My Profile Account",
    settings: "System Settings",
  };

  const getInitials = (fullName: string) => {
    return fullName.split(" ").map(w => w.charAt(0)).join("").slice(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* ─── Desktop Sidebar ─── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        className="hidden md:flex flex-col border-r border-border/40 bg-card/60 backdrop-blur-xl shrink-0 h-screen sticky top-0 overflow-y-auto z-40"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-border/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <BrainCircuit size={18} className="text-white animate-pulse" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent truncate"
              >
                ReviewLens <span className="text-[10px] text-purple-500 font-semibold px-1 rounded bg-purple-500/10 border border-purple-500/20">SaaS</span>
              </motion.div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-l-2 border-purple-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon size={18} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-purple-500" : ""}`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!collapsed && item.badge && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] px-1.5 py-0 h-4 border-none shrink-0 font-bold">
                    {item.badge}
                  </Badge>
                )}
                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 bg-popover border border-border/80 px-2 py-1 rounded-md text-xs font-semibold shadow-md whitespace-nowrap z-50 transition-all pointer-events-none origin-left">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Collapse Toggle & Info */}
        <div className="p-3 border-t border-border/40">
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-full rounded-xl"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight size={18} />
            </Button>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={13} className="text-purple-500" />
                <span>DB Status</span>
              </div>
              <span className="font-semibold text-foreground">{reviewCount} reviews</span>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ─── Mobile Drawer Sidebar ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border/40 z-50 flex flex-col p-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    R
                  </div>
                  <span className="font-bold text-sm">ReviewLens</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <ChevronLeft size={16} />
                </Button>
              </div>
              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-l-2 border-purple-500"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-purple-500 text-white text-[9px] px-1.5 h-4 border-none">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Wrapper ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/40 bg-card/45 backdrop-blur-xl supports-[backdrop-filter]:bg-card/30 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <div>
              <h2 className="text-base md:text-lg font-bold leading-none">{viewTitles[activeView]}</h2>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block mt-0.5">
                ReviewLens Customer Feedback Agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats Search Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-muted/30 text-xs text-muted-foreground">
              <Search size={12} className="text-muted-foreground/60" />
              <span>Real-time DB synced</span>
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-purple-500 rounded-full border border-card" />
            </Button>

            {/* Dark Mode Selector */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun size={18} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Profile */}
            <div
              onClick={() => setActiveView("profile")}
              className="h-8 w-8 rounded-full overflow-hidden border border-border/30 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
                  {user ? getInitials(user.name) : "CX"}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
