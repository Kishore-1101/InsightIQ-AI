import React from "react";
import { motion } from "framer-motion";
import {
  Star, MessageSquareText, TrendingUp, BrainCircuit, Activity,
  ThumbsUp, ThumbsDown, BarChart3, Globe, AlertCircle, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Tooltip, Legend
} from "recharts";

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

interface DashboardViewProps {
  stats: Stats | null;
  onNavigate: (view: string) => void;
}

const COLORS = {
  positive: "oklch(0.696 0.17 162.48)", // emerald
  neutral: "oklch(0.556 0 0)", // slate
  negative: "oklch(0.704 0.191 22.216)", // red
  accent: "oklch(0.488 0.243 264.376)", // violet
  amber: "oklch(0.828 0.189 84.429)", // gold
};

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as any }
};

export default function DashboardView({ stats, onNavigate }: DashboardViewProps) {
  if (!stats || stats.totalReviews === 0) {
    return (
      <Card className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card/60 backdrop-blur-md border-border/40">
        <AlertCircle size={48} className="text-muted-foreground/40 mb-4 animate-bounce" />
        <CardTitle className="text-xl font-bold">No Data Available</CardTitle>
        <CardDescription className="max-w-md mt-2">
          It looks like your reviews database is empty. Import a CSV file or add a new customer review to unlock the analytics dashboard.
        </CardDescription>
        <button
          onClick={() => onNavigate("upload")}
          className="mt-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 text-sm transition-all"
        >
          Go to Import Center
        </button>
      </Card>
    );
  }

  const sentimentPieData = [
    { name: "Positive", value: stats.sentimentCounts.positive, color: COLORS.positive },
    { name: "Neutral", value: stats.sentimentCounts.neutral, color: COLORS.neutral },
    { name: "Negative", value: stats.sentimentCounts.negative, color: COLORS.negative },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Metric Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reviews */}
        <motion.div {...fadeInUp} className="group">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 hover:border-purple-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Feedback</p>
                <h3 className="text-3xl font-bold tracking-tight">{stats.totalReviews}</h3>
                <p className="text-[10px] text-muted-foreground">Cumulative reviews parsed</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                <MessageSquareText size={20} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Average Rating */}
        <motion.div {...fadeInUp} transition={{ delay: 0.05 }} className="group">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Average Rating</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-bold tracking-tight">{stats.avgRating}</h3>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className={s <= Math.round(stats.avgRating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <Star size={20} className="fill-amber-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Net Promoter Score */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="group">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">NPS Index</p>
                <h3 className="text-3xl font-bold tracking-tight">{stats.nps}</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                  {stats.nps >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{stats.nps >= 30 ? "Excellent" : stats.nps >= 0 ? "Good" : "Needs Review"}</span>
                </div>
              </div>
              <div className={`p-3.5 rounded-2xl group-hover:scale-110 transition-transform ${
                stats.nps >= 30 ? "bg-emerald-500/10 text-emerald-500" : stats.nps >= 0 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
              }`}>
                <TrendingUp size={20} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: AI Confidence */}
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }} className="group">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 hover:border-indigo-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">NLP Confidence</p>
                <h3 className="text-3xl font-bold tracking-tight">{stats.avgConfidence}%</h3>
                <p className="text-[10px] text-muted-foreground">Mean classification score</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                <BrainCircuit size={20} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Sentiment Distribution & Rating Distribution ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Sentiment Breakdown (Pie + Bars) */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="lg:col-span-5 flex flex-col h-full">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity size={16} className="text-purple-500" />
                Sentiment Breakdown
              </CardTitle>
              <CardDescription>Aggregate sentiment and percentages</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {sentimentPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 shrink-0">
                  {sentimentPieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[10px] text-muted-foreground leading-none">{item.name}</p>
                        <p className="text-sm font-bold mt-0.5">{item.value} reviews</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress sliders */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                {[
                  { label: "Positive", pct: stats.sentimentPcts.positive, color: "bg-emerald-500" },
                  { label: "Neutral", pct: stats.sentimentPcts.neutral, color: "bg-slate-400" },
                  { label: "Negative", pct: stats.sentimentPcts.negative, color: "bg-red-500" },
                ].map((s) => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-muted-foreground">{s.label}</span>
                      <span className="font-bold">{s.pct}%</span>
                    </div>
                    <Progress value={s.pct} className="h-1.5 bg-muted" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Card: Rating Distribution Bar Chart */}
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }} className="lg:col-span-7">
          <Card className="bg-card/50 backdrop-blur-md border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 size={16} className="text-purple-500" />
                Rating Distribution
              </CardTitle>
              <CardDescription>Number of reviews received for each star tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ratingDist} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis dataKey="rating" type="category" width={30} tickFormatter={(v) => `${v}★`} stroke="var(--muted-foreground)" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {stats.ratingDist.map((entry, index) => {
                        let fill = COLORS.neutral;
                        if (entry.rating >= 4) fill = COLORS.positive;
                        if (entry.rating <= 2) fill = COLORS.negative;
                        return <Cell key={index} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Product Comparison & Topic Radar ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Comparison list */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="lg:col-span-6">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe size={16} className="text-purple-500" />
                Product Matrix
              </CardTitle>
              <CardDescription>Sentiment and counts across inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.productStats.map((prod) => (
                <div key={prod.name} className="p-3.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold truncate max-w-[180px]">{prod.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex text-amber-400">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-xs font-bold">{prod.avgRating}</span>
                      <span className="text-[10px] text-muted-foreground">({prod.count} revs)</span>
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    <div className="bg-emerald-500" style={{ width: `${prod.positivePct}%` }} title={`Positive: ${prod.positivePct}%`} />
                    <div className="bg-slate-400" style={{ width: `${prod.neutralPct}%` }} title={`Neutral: ${prod.neutralPct}%`} />
                    <div className="bg-red-500" style={{ width: `${prod.negativePct}%` }} title={`Negative: ${prod.negativePct}%`} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted-foreground">
                    <span>{prod.positivePct}% Positive feedback</span>
                    <span>{prod.negativePct}% Negative</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Topic Radar Chart */}
        <motion.div {...fadeInUp} transition={{ delay: 0.35 }} className="lg:col-span-6">
          <Card className="bg-card/50 backdrop-blur-md border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity size={16} className="text-purple-500" />
                Customer Emotion & Topics
              </CardTitle>
              <CardDescription>Mentions pattern of top 8 categories</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="h-[280px] w-full max-w-[320px]">
                {stats.topicStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={stats.topicStats.slice(0, 8).map(t => ({ name: t.name, count: t.count }))}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                      <Radar name="Mentions" dataKey="count" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.2} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No topic distribution parsed.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Recent Sentiment Flow Area Chart ─── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-500" />
              Recent Sentiment Flow
            </CardTitle>
            <CardDescription>Daily rating progression over latest reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData} margin={{ left: -15, right: 10 }}>
                  <defs>
                    <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="rating" name="Star Rating" stroke={COLORS.accent} fill="url(#flowGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
