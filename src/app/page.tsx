"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardView from "@/components/views/DashboardView";
import ReviewsView from "@/components/views/ReviewsView";
import UploadView from "@/components/views/UploadView";
import InsightsView from "@/components/views/InsightsView";
import ChatView from "@/components/views/ChatView";
import SettingsView from "@/components/views/SettingsView";
import { Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  sentiment: string;
  confidence: number;
  topics: string;
  keywords: string;
  source: string;
  productName: string;
  createdAt: string;
}

interface Stats {
  totalReviews: number;
  avgRating: number;
  nps: number;
  sentimentCounts: { positive: number; negative: number; neutral: number };
  sentimentPcts: { positive: number; negative: number; neutral: number };
  ratingDist: { rating: number; count: number }[];
  productStats: { name: string; count: number; avgRating: number; positivePct: number; negativePct: number; neutralPct: number }[];
  topicStats: { name: string; count: number }[];
  avgConfidence: number;
  trendData: { date: string; sentiment: number; rating: number }[];
}

export default function ReviewAnalysisAgent() {
  const [activeView, setActiveView] = useState("dashboard");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filterSentiment !== "all") params.set("sentiment", filterSentiment);
      if (filterProduct !== "all") params.set("product", filterProduct);
      params.set("sort", sortBy);
      params.set("page", "1");
      params.set("limit", "100"); // Fetch a broad list for client-side pagination / TanStack table support

      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  }, [searchQuery, filterSentiment, filterProduct, sortBy]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchReviews(), fetchStats()]);
  }, [fetchReviews, fetchStats]);

  useEffect(() => {
    refreshAllData().finally(() => setLoading(false));
  }, [refreshAllData]);

  // Operations handlers
  const handleManualSubmit = async (review: { author: string; rating: number; content: string; productName: string }) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...review, source: "manual" }),
    });
    if (!res.ok) throw new Error("Failed to submit manual review");
    await refreshAllData();
  };

  const handleCSVSubmit = async (reviewsData: Array<{ author: string; rating: number; content: string; productName: string }>) => {
    const res = await fetch("/api/reviews/analyze", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews: reviewsData }),
    });
    if (!res.ok) throw new Error("Failed to import CSV reviews");
    await refreshAllData();
  };

  const handleDeleteReview = async (id: string) => {
    const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAllData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-background">
        {/* Mock Sidebar Skeleton */}
        <div className="w-64 border-r border-border/40 p-4 space-y-6 hidden md:block">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <div className="space-y-3 pt-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border/40 px-6 flex items-center justify-between">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </header>
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[280px] rounded-xl" />
              <Skeleton className="h-[280px] rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const products = stats?.productStats.map((p) => p.name) || [];

  return (
    <AppShell
      activeView={activeView}
      setActiveView={setActiveView}
      reviewCount={stats?.totalReviews || 0}
    >
      <Toaster position="top-right" richColors />
      {activeView === "dashboard" && (
        <DashboardView stats={stats} onNavigate={setActiveView} />
      )}
      {activeView === "reviews" && (
        <ReviewsView
          reviews={reviews}
          onDelete={handleDeleteReview}
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterSentiment={filterSentiment}
          setFilterSentiment={setFilterSentiment}
          filterProduct={filterProduct}
          setFilterProduct={setFilterProduct}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}
      {activeView === "upload" && (
        <UploadView onManualSubmit={handleManualSubmit} onCSVSubmit={handleCSVSubmit} />
      )}
      {activeView === "insights" && <InsightsView />}
      {activeView === "chat" && <ChatView />}
      {activeView === "settings" && <SettingsView />}
    </AppShell>
  );
}