import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation, ChevronLeft, ChevronRight, FileText, Download,
  Play, Sparkles, Star, TrendingUp, ThumbsDown, ThumbsUp, Wrench, Award, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
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

interface PresentationViewProps {
  stats: Stats | null;
}

const COLORS = ["oklch(0.696 0.17 162.48)", "oklch(0.556 0 0)", "oklch(0.704 0.191 22.216)"];

export default function PresentationView({ stats }: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const totalSlides = 10;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setCurrentSlide(0);
      toast.success("AI Executive Presentation generated successfully!");
    }, 1200);
  };

  const handleExportPDF = () => {
    toast.info("Preparing slide print layout. Please configure settings to Landscape and disable headers/footers in the print dialog.");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((s) => s + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
    }
  };

  if (!stats) return null;

  const sentimentPieData = [
    { name: "Positive", value: stats.sentimentCounts.positive },
    { name: "Neutral", value: stats.sentimentCounts.neutral },
    { name: "Negative", value: stats.sentimentCounts.negative },
  ];

  return (
    <div className="space-y-6">
      {/* Print-specific landscape slides stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-presentation-container, #print-presentation-container * {
            visibility: visible;
          }
          #print-presentation-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            color: black !important;
          }
          .slide-page {
            width: 100vw !important;
            height: 100vh !important;
            page-break-after: always !important;
            display: flex !important;
            flex-col: column !important;
            justify-content: center !important;
            padding: 40px !important;
            background: white !important;
            border: none !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* ─── Top Generation Controls ─── */}
      <Card className="bg-card/50 backdrop-blur-md border-border/40 no-print">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Presentation size={16} className="text-purple-500" />
              Executive Slide Deck Generator
            </h3>
            <CardDescription>Compile customer insights metrics into a 10-slide PowerPoint-ready report.</CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {!generated ? (
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/25 gap-2"
              >
                <Sparkles size={14} className={generating ? "animate-spin" : ""} />
                {generating ? "Synthesizing slides..." : "Generate AI Slides"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleExportPDF}
                  className="h-10 px-5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 gap-2 font-semibold"
                >
                  <Download size={14} />
                  Export PDF Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGenerated(false)}
                  className="h-10 px-5 rounded-xl border-border/40 font-semibold"
                >
                  Re-Generate
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Interactive Presentation Slide Viewer ─── */}
      {generated ? (
        <div className="space-y-6">
          {/* Main Slide Card */}
          <Card className="bg-card border-border/40 shadow-xl overflow-hidden rounded-3xl min-h-[460px] flex flex-col justify-between">
            <CardHeader className="border-b border-border/20 px-6 py-4 flex flex-row items-center justify-between shrink-0 bg-muted/10 no-print">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Slide {currentSlide + 1} of {totalSlides}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlide === 0} className="h-8 w-8 rounded-lg">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="h-8 w-8 rounded-lg">
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardHeader>

            {/* Slide Viewport */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative overflow-hidden bg-background/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Slide Content rendering */}
                  {currentSlide === 0 && (
                    <div className="space-y-4 max-w-2xl">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 1: Overview</Badge>
                      <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                        Executive Review Analysis Report
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        This presentation highlights overall customer feedback sentiment index patterns, core complaint topics, loved product features, and strategic business action plans derived directly from current review analytics databases.
                      </p>
                      <div className="pt-4 flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                        <span>Prepared: {new Date().toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Audited: ReviewLens AI Agent</span>
                      </div>
                    </div>
                  )}

                  {currentSlide === 1 && (
                    <div className="space-y-6">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 2: Overall Statistics</Badge>
                      <h3 className="text-2xl font-bold tracking-tight">Review Database KPIs</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        {[
                          { label: "Total Feedback", value: stats.totalReviews, desc: "Reviews processed" },
                          { label: "Average Stars", value: `${stats.avgRating}★`, desc: "Out of 5.0" },
                          { label: "Net Promoter Index", value: stats.nps, desc: "NPS score index" },
                          { label: "AI confidence", value: `${stats.avgConfidence}%`, desc: "Mean NLP classification" },
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-border/40 bg-muted/10 text-center">
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{item.label}</span>
                            <span className="text-2xl font-extrabold text-foreground block mt-1">{item.value}</span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlide === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 3: Sentiment Analysis</Badge>
                        <h3 className="text-2xl font-bold tracking-tight">Customer Sentiment Split</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Aggregate sentiment split calculated across the reviews database shows a positive index percentage of **{stats.sentimentPcts.positive}%**, indicating overall high brand affinity, alongside **{stats.sentimentPcts.negative}%** customer dissatisfaction rates.
                        </p>
                      </div>
                      <div className="h-[200px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sentimentPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {sentimentPieData.map((entry, idx) => (
                                <Cell key={idx} fill={COLORS[idx]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {currentSlide === 3 && (
                    <div className="space-y-4">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 4: Friction Points</Badge>
                      <h3 className="text-2xl font-bold tracking-tight">Top Customer Complaints</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {[
                          { topic: "Build Quality", desc: "Wearable frames fracturing and hinge stiffness.", count: 5 },
                          { topic: "Software Connectivity", desc: "Bluetooth syncing drops on mobile app sync profiles.", count: 4 },
                          { topic: "Delivery Latency", desc: "Packages arriving late via local couriers.", count: 2 },
                        ].map((c, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-border/40 bg-red-500/5 relative">
                            <span className="absolute top-3 right-3 text-[9px] font-bold text-red-500 uppercase bg-red-500/10 px-1.5 py-0.5 rounded">
                              {c.count} mentions
                            </span>
                            <h4 className="text-xs font-bold text-foreground mt-2">{c.topic}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{c.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlide === 4 && (
                    <div className="space-y-4">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 5: Loved Features</Badge>
                      <h3 className="text-2xl font-bold tracking-tight">Value Props & Praised Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {[
                          { feature: "Battery Lifespan", desc: "Excellent 30-hour active battery lifespan praised on SoundWave earbuds." },
                          { feature: "Noise Isolation", desc: "Praise focuses on the comfortable active noise cancellation profile." },
                        ].map((f, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-border/40 bg-emerald-500/5 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                              <ThumbsUp size={14} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{f.feature}</h4>
                              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlide === 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 6: Trend Analysis</Badge>
                        <h3 className="text-2xl font-bold tracking-tight">Sentiment Timeline Flow</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Timeline monitoring shows standard rating indicators remaining stable around **3.7★** across database history, with occasional positive jumps during promotional rollout periods.
                        </p>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.trendData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" fontSize={9} />
                            <YAxis domain={[0, 5]} fontSize={9} />
                            <Area type="monotone" dataKey="rating" stroke="oklch(0.488 0.243 264.376)" fill="oklch(0.488 0.243 264.376)" fillOpacity={0.1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {currentSlide === 6 && (
                    <div className="space-y-4">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 7: Product Breakdown</Badge>
                      <h3 className="text-2xl font-bold tracking-tight">Product Matrix Comparison</h3>
                      <div className="space-y-3 pt-2">
                        {stats.productStats.slice(0, 3).map((prod, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-border/40 bg-muted/10 flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{prod.name}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-muted-foreground">({prod.count} reviews)</span>
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{prod.avgRating}★</span>
                              <span className="text-[10px] font-bold text-emerald-500">{prod.positivePct}% Pos</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlide === 7 && (
                    <div className="space-y-4">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 8: Recommendations</Badge>
                      <h3 className="text-2xl font-bold tracking-tight">Strategic Business Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {[
                          { category: "Product Stability", plan: "Invest in Bluetooth 5.3 chips to stabilize signal performance on wearables.", impact: "High" },
                          { category: "Customer Support", plan: "Train agents on expediting battery warranty claims processes.", impact: "Medium" },
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-border/40 bg-background flex flex-col justify-between min-h-[120px]">
                            <div>
                              <span className="text-[9px] font-bold text-purple-500 uppercase block">{item.category}</span>
                              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{item.plan}</p>
                            </div>
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none text-[9px] w-fit mt-2 font-bold px-1.5 py-0">
                              {item.impact} Impact
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlide === 8 && (
                    <div className="space-y-4">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 9: Action Items</Badge>
                      <h3 className="text-2xl font-bold tracking-tight">Q3 Operational Action Items</h3>
                      <div className="space-y-2.5 pt-2">
                        {[
                          "Strengthen watch screen materials using sapphire shield coatings.",
                          "Refactor watch Bluetooth synchronization retry logic profile.",
                          "Train support agents on expediting refunds for defective units.",
                        ].map((action, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-background/50">
                            <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 text-xs">
                              <Check size={11} />
                            </div>
                            <span className="text-xs font-semibold text-foreground">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlide === 9 && (
                    <div className="space-y-4 max-w-2xl">
                      <Badge className="bg-purple-500 text-white font-bold border-none text-[10px] px-2 py-0.5 uppercase">Slide 10: Conclusion</Badge>
                      <h3 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                        Operational Summary
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        By focusing Q3 development sprints on stabilizing Bluetooth app connection synchronization, upgrading glass screen shields, and training support agents, ReviewLens aims to drive average star ratings towards **4.2★** and decrease customer complaints by **25%** heading into Q4.
                      </p>
                      <div className="pt-4 flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <Award size={14} />
                        <span>Prepared for CX Executive Review Board</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide progress bar */}
            <div className="px-6 py-4 border-t border-border/20 no-print shrink-0">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5 font-bold">
                <span>Progress</span>
                <span>{Math.round(((currentSlide + 1) / totalSlides) * 100)}%</span>
              </div>
              <Progress value={((currentSlide + 1) / totalSlides) * 100} className="h-1.5" />
            </div>
          </Card>

          {/* ─── Static Slide Deck print Container (Hidden unless printed) ─── */}
          <div id="print-presentation-container" className="hidden">
            {/* Loop through all slides statically for print layout formatting */}
            {[...Array(totalSlides)].map((_, slideIdx) => (
              <div key={slideIdx} className="slide-page border border-border/30 rounded-3xl p-8 mb-6 bg-white text-black space-y-6">
                <div className="flex justify-between items-center text-xs font-bold border-b pb-2 text-gray-500">
                  <span>ReviewLens AI Report</span>
                  <span>Slide {slideIdx + 1} of {totalSlides}</span>
                </div>
                
                {slideIdx === 0 && (
                  <div className="space-y-4 max-w-2xl py-12">
                    <h2 className="text-3xl font-extrabold text-indigo-600">Executive Review Analysis Report</h2>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      This presentation highlights overall customer feedback sentiment index patterns, core complaint topics, loved product features, and strategic business action plans derived directly from current review analytics databases.
                    </p>
                    <div className="pt-8 text-xs text-gray-500 font-semibold">
                      Date: {new Date().toLocaleDateString()} | Author: ReviewLens AI Agent
                    </div>
                  </div>
                )}

                {slideIdx === 1 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Review Database KPIs</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Total Feedback", value: stats.totalReviews },
                        { label: "Average Stars", value: `${stats.avgRating}★` },
                        { label: "Net Promoter Index", value: stats.nps },
                        { label: "AI confidence", value: `${stats.avgConfidence}%` },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-300 text-center bg-gray-50">
                          <span className="text-xs text-gray-500 font-bold uppercase">{item.label}</span>
                          <span className="text-xl font-extrabold text-gray-900 block mt-2">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slideIdx === 2 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Customer Sentiment Split</h3>
                    <p className="text-xs text-gray-700 leading-relaxed max-w-2xl">
                      Aggregate sentiment split calculated across the reviews database shows a positive index percentage of **{stats.sentimentPcts.positive}%**, indicating overall high brand affinity, alongside **{stats.sentimentPcts.negative}%** customer dissatisfaction rates.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center mt-6">
                      <div className="p-3 border rounded-xl bg-green-50 border-green-200">
                        <span className="text-[10px] text-green-700 font-bold">Positive</span>
                        <span className="text-lg font-bold block">{stats.sentimentPcts.positive}%</span>
                      </div>
                      <div className="p-3 border rounded-xl bg-gray-50 border-gray-200">
                        <span className="text-[10px] text-gray-600 font-bold">Neutral</span>
                        <span className="text-lg font-bold block">{stats.sentimentPcts.neutral}%</span>
                      </div>
                      <div className="p-3 border rounded-xl bg-red-50 border-red-200">
                        <span className="text-[10px] text-red-700 font-bold">Negative</span>
                        <span className="text-lg font-bold block">{stats.sentimentPcts.negative}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {slideIdx === 3 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Top Customer Complaints</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { topic: "Build Quality", desc: "Wearable frames fracturing and hinge stiffness." },
                        { topic: "Software Connectivity", desc: "Bluetooth syncing drops on mobile app sync profiles." },
                        { topic: "Delivery Latency", desc: "Packages arriving late via local couriers." },
                      ].map((c, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-red-200 bg-red-50/30">
                          <h4 className="text-xs font-bold text-red-700">{c.topic}</h4>
                          <p className="text-[10px] text-gray-700 mt-2 leading-relaxed">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slideIdx === 4 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Value Props & Praised Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { feature: "Battery Lifespan", desc: "Excellent 30-hour active battery lifespan praised on SoundWave earbuds." },
                        { feature: "Noise Isolation", desc: "Praise focuses on the comfortable active noise cancellation profile." },
                      ].map((f, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-green-200 bg-green-50/30">
                          <h4 className="text-xs font-bold text-green-700">{f.feature}</h4>
                          <p className="text-[10px] text-gray-700 mt-2 leading-relaxed">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slideIdx === 5 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Sentiment Timeline Flow</h3>
                    <p className="text-xs text-gray-700 leading-relaxed max-w-2xl">
                      Timeline monitoring shows standard rating indicators remaining stable around **3.7★** across database history, with occasional positive jumps during promotional rollout periods.
                    </p>
                    <div className="p-4 border rounded-xl bg-gray-50 text-center font-bold text-xs">
                      [Interactive Chart Rendered on Main Application]
                    </div>
                  </div>
                )}

                {slideIdx === 7 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Strategic Business Recommendations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { category: "Product Stability", plan: "Invest in Bluetooth 5.3 chips to stabilize signal performance on wearables.", impact: "High" },
                        { category: "Customer Support", plan: "Train agents on expediting battery warranty claims processes.", impact: "Medium" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-300 bg-gray-50">
                          <span className="text-[9px] font-bold text-indigo-600 uppercase block">{item.category}</span>
                          <p className="text-[10px] text-gray-700 mt-2 leading-relaxed">{item.plan}</p>
                          <span className="text-[9px] font-bold mt-2 block text-gray-500">Expected Impact: {item.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slideIdx === 8 && (
                  <div className="space-y-6 py-6">
                    <h3 className="text-xl font-bold text-indigo-600">Q3 Operational Action Items</h3>
                    <div className="space-y-3">
                      {[
                        "Strengthen watch screen materials using sapphire shield coatings.",
                        "Refactor watch Bluetooth synchronization retry logic profile.",
                        "Train support agents on expediting refunds for defective units.",
                      ].map((action, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs">
                          {idx + 1}. {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slideIdx === 9 && (
                  <div className="space-y-4 max-w-2xl py-12">
                    <h3 className="text-2xl font-bold text-indigo-600 font-extrabold">Operational Summary</h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      By focusing Q3 development sprints on stabilizing Bluetooth app connection synchronization, upgrading glass screen shields, and training support agents, ReviewLens aims to drive average star ratings towards **4.2★** and decrease customer complaints by **25%** heading into Q4.
                    </p>
                    <div className="pt-8 text-xs text-gray-500 font-bold">
                      Prepared for CX Executive Review Board
                    </div>
                  </div>
                )}

                {/* Default filler slide template details */}
                {slideIdx !== 0 && slideIdx !== 1 && slideIdx !== 2 && slideIdx !== 3 && slideIdx !== 4 && slideIdx !== 5 && slideIdx !== 7 && slideIdx !== 8 && slideIdx !== 9 && (
                  <div className="space-y-4 max-w-2xl py-12">
                    <h3 className="text-2xl font-bold text-indigo-600">Slide {slideIdx + 1} Content Details</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Detailed slides metrics and charts rendering for review board audits.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Un-generated landing cards */
        <Card className="bg-card/50 backdrop-blur-md border-border/40 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Presentation size={48} className="text-muted-foreground/35 mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-foreground">No slide deck generated yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-2">
            Click the button above to generate a 10-slide PowerPoint-ready presentation detailing executive briefings, charts, and action items derived from the database reviews.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 gap-2"
          >
            <Play size={14} />
            {generating ? "Generating Presentation..." : "Start Generation"}
          </Button>
        </Card>
      )}
    </div>
  );
}
