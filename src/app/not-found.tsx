"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--muted)/15_0%,transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6 bg-card/45 backdrop-blur-xl border border-border/40 p-8 rounded-3xl shadow-xl relative z-10"
      >
        <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-md">
          <HelpCircle size={32} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The page you are trying to access does not exist or has been permanently moved to a new destination.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 gap-2">
            <Link href="/">
              <LayoutDashboard size={14} />
              Return to Dashboard
              <ChevronRight size={14} />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
