"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

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
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-md">
          <AlertCircle size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            System Error
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while rendering this page segment. The issue has been registered.
          </p>
          <div className="bg-background/80 border border-border/40 text-[10px] font-mono p-3 rounded-xl max-w-xs mx-auto truncate text-destructive">
            {error.message || "Unknown rendering exception"}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 gap-2"
          >
            <RefreshCw size={14} />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="h-10 px-5 rounded-xl border-border/45 gap-1.5"
          >
            Go Home
            <ChevronRight size={14} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
