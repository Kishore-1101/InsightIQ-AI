"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  BarChart3, MessageSquarePlus, TrendingUp, Search, Star, ThumbsUp, ThumbsDown,
  Minus, Download, Upload, Trash2, RefreshCw, Filter, Sparkles, Globe,
  PieChart as PieChartIcon, Activity, Eye, BrainCircuit, ChevronDown,
  Sun, Moon, LayoutDashboard, MessageSquareText, BarChart2, Tag, X, ArrowUpRight, ArrowDownRight,
  MessageCircle, Send, Bot, UserCircle, Minimize2, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

// ─── Types ───
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
  keywordStats: { text: string; value: number }[];
  avgConfidence: number;
  trendData: { date: string; sentiment: number; rating: number }[];
}

// ─── Color Palette ───
const COLORS = {
  positive: "hsl(142, 71%, 45%)",
  negative: "hsl(0, 84%, 60%)",
  neutral: "hsl(215, 20%, 55%)",
  accent: "hsl(280, 67%, 52%)",
  chart1: "hsl(142, 71%, 45%)",
  chart2: "hsl(0, 84%, 60%)",
  chart3: "hsl(215, 20%, 55%)",
  chart4: "hsl(45, 93%, 47%)",
  chart5: "hsl(280, 67%, 52%)",
};

const CHART_CONFIG = {
  positive: { label: "Positive", color: COLORS.chart1 },
  negative: { label: "Negative", color: COLORS.chart2 },
  neutral: { label: "Neutral", color: COLORS.chart3 },
  count: { label: "Count", color: COLORS.chart4 },
  rating: { label: "Rating", color: COLORS.chart5 },
};

// ─── Animation Variants ───
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ─── Star Rating Component ───
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }
        />
      ))}
    </div>
  );
}

// ─── Sentiment Badge ───
function SentimentBadge({ sentiment, confidence }: { sentiment: string; confidence: number }) {
  const config = {
    positive: { icon: ThumbsUp, class: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    negative: { icon: ThumbsDown, class: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
    neutral: { icon: Minus, class: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  };
  const c = config[sentiment as keyof typeof config] || config.neutral;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`${c.class} gap-1 text-xs font-medium`}>
      <Icon size={12} />
      {sentiment}
      <span className="opacity-60">({Math.round(confidence * 100)}%)</span>
    </Badge>
  );
}

// ─── Metric Card ───
function MetricCard({ title, value, subtitle, icon: Icon, trend, color = "default" }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; trend?: "up" | "down" | "neutral"; color?: string;
}) {
  const colorMap: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };
  return (
    <motion.div {...fadeInUp}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
              {subtitle && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {trend === "up" && <ArrowUpRight size={14} className="text-emerald-500" />}
                  {trend === "down" && <ArrowDownRight size={14} className="text-red-500" />}
                  {subtitle}
                </div>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.default}`}>
              <Icon size={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Word Cloud Component ───
function WordCloud({ words }: { words: { text: string; value: number }[] }) {
  if (!words.length) return null;
  const maxVal = Math.max(...words.map(w => w.value));
  const minVal = Math.min(...words.map(w => w.value));
  const range = maxVal - minVal || 1;

  const getColor = (val: number) => {
    const ratio = (val - minVal) / range;
    if (ratio > 0.7) return "text-emerald-500 dark:text-emerald-400";
    if (ratio > 0.4) return "text-amber-500 dark:text-amber-400";
    return "text-slate-500 dark:text-slate-400";
  };

  const getSize = (val: number) => {
    const ratio = (val - minVal) / range;
    if (ratio > 0.7) return "text-2xl md:text-3xl font-bold";
    if (ratio > 0.5) return "text-xl md:text-2xl font-semibold";
    if (ratio > 0.3) return "text-lg md:text-xl font-medium";
    return "text-base md:text-lg font-normal";
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4">
      {words.slice(0, 30).map((w, i) => (
        <motion.span
          key={w.text}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03, duration: 0.3 }}
          className={`${getSize(w.value)} ${getColor(w.value)} cursor-default hover:opacity-80 transition-opacity`}
          title={`${w.text}: ${w.value} mentions`}
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Review Card Component ───
function ReviewCard({ review, onDelete }: { review: Review; onDelete: (id: string) => void }) {
  const topics = JSON.parse(review.topics || "[]") as string[];
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content.length > 150;

  return (
    <motion.div {...fadeInUp} layout>
      <Card className="group hover:shadow-md transition-all">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {review.author.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{review.author}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={review.rating} size={12} />
                  {review.productName && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 truncate max-w-[120px]">
                      {review.productName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SentimentBadge sentiment={review.sentiment} confidence={review.confidence} />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(review.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {isLong && !expanded ? review.content.slice(0, 150) + "..." : review.content}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary hover:underline ml-1 text-xs font-medium"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>

          {topics.length > 0 && topics[0] !== "General" && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-[10px] px-2 py-0">
                  <Tag size={10} className="mr-1" />
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <span className="text-[11px] text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <Badge variant="secondary" className="text-[10px] h-5 capitalize">
              <Globe size={10} className="mr-1" />
              {review.source}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Application ───
export default function ReviewAnalysisAgent() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // New review form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (filterSentiment !== "all") params.set("sentiment", filterSentiment);
    if (filterProduct !== "all") params.set("product", filterProduct);
    params.set("sort", sortBy);
    params.set("page", page.toString());
    params.set("limit", "20");

    const res = await fetch(`/api/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews || []);
  }, [searchQuery, filterSentiment, filterProduct, sortBy, page]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchReviews(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchReviews, fetchStats]);

  const handleAddReview = async () => {
    if (!newContent.trim() || !newAuthor.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: newAuthor,
          rating: newRating,
          content: newContent,
          productName: newProduct,
          source: "manual",
        }),
      });
      setNewAuthor("");
      setNewContent("");
      setNewProduct("");
      setNewRating(5);
      setShowAddForm(false);
      fetchReviews();
      fetchStats();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    fetchReviews();
    fetchStats();
  };

  const handleReAnalyze = async () => {
    setAnalyzing(true);
    try {
      await fetch("/api/reviews/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      fetchReviews();
      fetchStats();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const reviewsData = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      if (row.content && row.rating) {
        reviewsData.push({
          author: row.author || "CSV Import",
          rating: row.rating,
          content: row.content,
          productName: row.product || row.productname || "",
        });
      }
    }

    if (reviewsData.length > 0) {
      setSubmitting(true);
      try {
        await fetch("/api/reviews/analyze", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviews: reviewsData }),
        });
        fetchReviews();
        fetchStats();
      } finally {
        setSubmitting(false);
      }
    }
    e.target.value = "";
  };

  const handleExport = () => {
    window.open("/api/export", "_blank");
  };

  // Reset page on filter changes
  useEffect(() => { setPage(1); }, [searchQuery, filterSentiment, filterProduct, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </div>
    );
  }

  const sentimentPieData = stats
    ? [
        { name: "Positive", value: stats.sentimentCounts.positive, fill: COLORS.chart1 },
        { name: "Negative", value: stats.sentimentCounts.negative, fill: COLORS.chart2 },
        { name: "Neutral", value: stats.sentimentCounts.neutral, fill: COLORS.chart3 },
      ]
    : [];

  const products = stats?.productStats.map((p) => p.name) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">ReviewLens</h1>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">AI Review Analysis Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun size={18} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex gap-1.5">
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="h-10">
              <TabsTrigger value="dashboard" className="gap-1.5 text-sm px-3">
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5 text-sm px-3">
                <MessageSquareText size={16} />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1.5 text-sm px-3">
                <BarChart2 size={16} />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="add" className="gap-1.5 text-sm px-3">
                <MessageSquarePlus size={16} />
                <span className="hidden sm:inline">Add Review</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReAnalyze}
                disabled={analyzing}
                className="gap-1.5"
              >
                <RefreshCw size={14} className={analyzing ? "animate-spin" : ""} />
                Re-Analyze
              </Button>
              <Button
                size="sm"
                onClick={() => { setActiveTab("add"); setShowAddForm(true); }}
                className="gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              >
                <Sparkles size={14} />
                New Review
              </Button>
            </div>
          </div>

          {/* ═══════════════════ DASHBOARD TAB ═══════════════════ */}
          <TabsContent value="dashboard">
            <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Reviews"
                  value={stats?.totalReviews || 0}
                  subtitle="Across all products"
                  icon={MessageSquareText}
                  color="default"
                />
                <MetricCard
                  title="Average Rating"
                  value={stats?.avgRating || "0"}
                  subtitle="Out of 5.0 stars"
                  icon={Star}
                  trend="up"
                  color="amber"
                />
                <MetricCard
                  title="NPS Score"
                  value={stats?.nps || 0}
                  subtitle="Net Promoter Score"
                  icon={TrendingUp}
                  trend={stats && stats.nps >= 0 ? "up" : "down"}
                  color={stats && stats.nps >= 30 ? "emerald" : stats && stats.nps >= 0 ? "amber" : "red"}
                />
                <MetricCard
                  title="AI Confidence"
                  value={`${stats?.avgConfidence || 0}%`}
                  subtitle="Avg. analysis accuracy"
                  icon={BrainCircuit}
                  color="violet"
                />
              </div>

              {/* Sentiment Distribution & Rating Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Pie Chart */}
                <motion.div {...fadeInUp}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <PieChartIcon size={18} className="text-primary" />
                        Sentiment Distribution
                      </CardTitle>
                      <CardDescription>Overall customer sentiment breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <ChartContainer config={CHART_CONFIG} className="h-[200px] flex-1">
                          <PieChart>
                            <Pie
                              data={sentimentPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {sentimentPieData.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          </PieChart>
                        </ChartContainer>
                        <div className="space-y-3 min-w-[100px]">
                          {sentimentPieData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                              <div>
                                <p className="text-xs font-medium">{item.name}</p>
                                <p className="text-lg font-bold">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Sentiment Progress Bars */}
                      <div className="mt-4 space-y-2">
                        {[
                          { label: "Positive", pct: stats?.sentimentPcts.positive || 0, color: "bg-emerald-500" },
                          { label: "Neutral", pct: stats?.sentimentPcts.neutral || 0, color: "bg-slate-400" },
                          { label: "Negative", pct: stats?.sentimentPcts.negative || 0, color: "bg-red-500" },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center gap-3">
                            <span className="text-xs w-16 text-muted-foreground">{s.label}</span>
                            <Progress value={s.pct} className="h-2 flex-1" />
                            <span className="text-xs font-bold w-10 text-right">{s.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Rating Distribution Bar Chart */}
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BarChart3 size={18} className="text-primary" />
                        Rating Distribution
                      </CardTitle>
                      <CardDescription>Number of reviews per star rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={CHART_CONFIG} className="h-[280px]">
                        <BarChart data={stats?.ratingDist || []} layout="vertical" margin={{ left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" />
                          <YAxis dataKey="rating" type="category" width={30} tickFormatter={(v) => `${v}★`} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="var(--color-chart4)">
                            {stats?.ratingDist.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={entry.rating >= 4 ? COLORS.chart1 : entry.rating === 3 ? COLORS.chart3 : COLORS.chart2}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Product Comparison & Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Comparison */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Globe size={18} className="text-primary" />
                        Product Comparison
                      </CardTitle>
                      <CardDescription>Sentiment analysis by product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats?.productStats.map((product) => (
                          <div key={product.name} className="p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">{product.name}</span>
                              <div className="flex items-center gap-2">
                                <StarRating rating={Math.round(product.avgRating)} size={12} />
                                <span className="text-sm font-bold">{product.avgRating}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                              <div className="bg-emerald-500 rounded-l-full" style={{ width: `${product.positivePct}%` }} />
                              <div className="bg-slate-400" style={{ width: `${product.neutralPct}%` }} />
                              <div className="bg-red-500 rounded-r-full" style={{ width: `${product.negativePct}%` }} />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                              <span>{product.count} reviews</span>
                              <span>{product.positivePct}% positive</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Sentiment Trend Radar */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Activity size={18} className="text-primary" />
                        Topic Radar
                      </CardTitle>
                      <CardDescription>Top 8 most discussed topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={Object.fromEntries(
                          (stats?.topicStats || []).slice(0, 8).map((t, i) => [t.name, { label: t.name, color: [`hsl(142, 71%, ${45 - i * 4}%)`, `hsl(142, 71%, ${45 - i * 4}%)`] }])
                        )}
                        className="h-[280px]"
                      >
                        <RadarChart data={stats?.topicStats.slice(0, 8).map(t => ({ topic: t.name, count: t.count })) || []}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
                          <Radar name="Mentions" dataKey="count" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.2} />
                          <ChartTooltip />
                        </RadarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════ REVIEWS TAB ═══════════════════ */}
          <TabsContent value="reviews">
            <motion.div {...fadeInUp} className="space-y-4">
              {/* Filters Bar */}
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                      <SelectTrigger className="w-[130px] h-9 text-sm">
                        <Filter size={14} className="mr-1.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sentiment</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterProduct} onValueChange={setFilterProduct}>
                      <SelectTrigger className="w-[160px] h-9 text-sm">
                        <Globe size={14} className="mr-1.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[130px] h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="rating-high">Rating: High-Low</SelectItem>
                        <SelectItem value="rating-low">Rating: Low-High</SelectItem>
                      </SelectContent>
                    </Select>
                    {(searchQuery || filterSentiment !== "all" || filterProduct !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearchQuery(""); setFilterSentiment("all"); setFilterProduct("all"); }}
                        className="h-9 gap-1"
                      >
                        <X size={14} />
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onDelete={handleDeleteReview} />
                  ))}
                </AnimatePresence>
              </div>

              {reviews.length === 0 && (
                <div className="text-center py-16">
                  <Eye size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No reviews found</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters or add new reviews</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ═══════════════════ INSIGHTS TAB ═══════════════════ */}
          <TabsContent value="insights">
            <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
              {/* Word Cloud */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" />
                      Keyword Cloud
                    </CardTitle>
                    <CardDescription>Most frequently mentioned keywords across all reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WordCloud words={stats?.keywordStats || []} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Topic Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Tag size={18} className="text-primary" />
                        Topic Frequency
                      </CardTitle>
                      <CardDescription>How often each topic appears in reviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={CHART_CONFIG} className="h-[300px]">
                        <BarChart data={stats?.topicStats || []} margin={{ left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, angle: -45, textAnchor: "end" }} height={80} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {stats?.topicStats.map((_, index) => (
                              <Cell
                                key={index}
                                fill={`hsl(${(index * 45) % 360}, 65%, 55%)`}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Sentiment Trend */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary" />
                        Recent Sentiment Flow
                      </CardTitle>
                      <CardDescription>Rating trend of latest 10 reviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={CHART_CONFIG} className="h-[300px]">
                        <AreaChart data={stats?.trendData || []} margin={{ left: 0, right: 0 }}>
                          <defs>
                            <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 5]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="rating" stroke={COLORS.accent} fill="url(#ratingGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Product Sentiment Matrix */}
              <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <BrainCircuit size={18} className="text-primary" />
                      Product Sentiment Matrix
                    </CardTitle>
                    <CardDescription>Detailed sentiment breakdown per product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold">Product</th>
                            <th className="text-center py-3 px-4 font-semibold">Reviews</th>
                            <th className="text-center py-3 px-4 font-semibold">Avg Rating</th>
                            <th className="text-center py-3 px-4 font-semibold">Positive</th>
                            <th className="text-center py-3 px-4 font-semibold">Neutral</th>
                            <th className="text-center py-3 px-4 font-semibold">Negative</th>
                            <th className="text-center py-3 px-4 font-semibold">Sentiment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.productStats.map((product, i) => (
                            <tr key={product.name} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                              <td className="py-3 px-4 font-medium">{product.name}</td>
                              <td className="py-3 px-4 text-center">{product.count}</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <StarRating rating={Math.round(product.avgRating)} size={12} />
                                  <span className="font-bold ml-1">{product.avgRating}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{product.positivePct}%</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-slate-500 font-semibold">{product.neutralPct}%</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-red-600 dark:text-red-400 font-semibold">{product.negativePct}%</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-0.5 h-4 justify-center">
                                  <div className="bg-emerald-500 rounded-l-full" style={{ width: `${product.positivePct * 0.6}px` }} />
                                  <div className="bg-slate-400" style={{ width: `${product.neutralPct * 0.6}px` }} />
                                  <div className="bg-red-500 rounded-r-full" style={{ width: `${product.negativePct * 0.6}px` }} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════ ADD REVIEW TAB ═══════════════════ */}
          <TabsContent value="add">
            <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles size={20} className="text-violet-500" />
                    Add New Review
                  </CardTitle>
                  <CardDescription>Submit a customer review and our AI agent will analyze sentiment, extract topics, and identify keywords automatically.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Author Name</label>
                      <Input
                        placeholder="e.g. John D."
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Name</label>
                      <Input
                        placeholder="e.g. WirelessPro Headphones"
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={28}
                            className={
                              star <= newRating
                                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                : "fill-muted text-muted-foreground/30"
                            }
                          />
                        </button>
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">{newRating} / 5</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Content</label>
                    <Textarea
                      placeholder="Write the customer review here... The AI agent will analyze sentiment, extract topics, and identify key phrases automatically."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleAddReview}
                      disabled={submitting || !newContent.trim() || !newAuthor.trim()}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BrainCircuit size={16} className="mr-2" />
                          Analyze & Add Review
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CSV Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload size={18} className="text-primary" />
                    Bulk Import (CSV)
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file with columns: author, rating, content, product. Each row will be automatically analyzed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <Upload size={24} className="text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {submitting ? "Importing..." : "Click to upload CSV or drag and drop"}
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      disabled={submitting}
                    />
                  </label>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>ReviewLens — AI-Powered Customer Review Analysis</p>
          <div className="flex items-center gap-1">
            <BrainCircuit size={12} />
            <span>Built with Next.js, Recharts & AI</span>
          </div>
        </div>
      </footer>

      {/* ═══════════ FLOATING AI CHAT WIDGET ═══════════ */}
      <AIChatWidget />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLOATING AI CHAT WIDGET
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your ReviewLens AI assistant. Ask me anything about your customer reviews — sentiment trends, product comparisons, common complaints, or action items. Try: \"What are the top complaints?\" or \"Compare products by rating.\"",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, minimized]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What are the top complaints?",
    "Which product has the best reviews?",
    "Summarize negative feedback",
    "What topics are trending?",
  ];

  return (
    <>
      {/* FAB Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[100]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setOpen(true)}
          className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
        </button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed z-[100] flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20"
            initial={minimized ? { opacity: 0, y: 0, scale: 0.95 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={minimized
              ? { opacity: 1, y: 0, scale: 1, bottom: 24, right: 24, width: 300, height: 56 }
              : { opacity: 1, y: 0, scale: 1, bottom: 24, right: 24, width: 400, height: 560 }
            }
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ position: "fixed" }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">ReviewLens AI</p>
                  <p className="text-[11px] text-emerald-500 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    Online — Analyzing your reviews
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                >
                  {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!minimized && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100% - 130px)" }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {msg.role === "assistant" ? <Bot size={14} /> : <UserCircle size={14} />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === "assistant"
                            ? "bg-muted text-foreground rounded-tl-md"
                            : "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-tr-md"
                        }`}
                      >
                        {msg.content.split("\n").map((line, j) => (
                          <React.Fragment key={j}>
                            {line.startsWith("- ") || line.startsWith("* ") || /^\d+\./.test(line) ? (
                              <span className="flex items-start gap-1.5">
                                <span className="shrink-0 mt-0.5">{line.startsWith("- ") || line.startsWith("* ") ? "•" : ""}</span>
                                <span>{line.replace(/^[-*]\s+|^\d+\.\s+/, "")}</span>
                              </span>
                            ) : (
                              <span>{line}</span>
                            )}
                            {j < msg.content.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                        <Bot size={14} />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && !loading && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="p-3 border-t border-border/50 bg-background">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about your reviews..."
                      disabled={loading}
                      className="flex-1 h-9 px-3 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 disabled:opacity-50 transition-all placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-40 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                  <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
                    AI-powered analysis of your review data
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── CSV Parser Helper ───
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}