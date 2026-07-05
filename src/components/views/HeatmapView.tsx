import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid, Star, AlertCircle, Info, Sparkles, HelpCircle,
  ThumbsUp, ThumbsDown, ArrowRight, Wrench, X, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  sentiment: string;
  confidence: number;
  topics: string; // JSON string
  keywords: string; // JSON string
  source: string;
  productName: string;
  createdAt: string;
}

interface HeatmapViewProps {
  reviews: Review[];
}

const TOPICS = ["Design", "Software", "Quality", "Battery", "Pricing", "Support"];

export default function HeatmapView({ reviews }: HeatmapViewProps) {
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");

  // Selected cell for inspector
  const [activeCell, setActiveCell] = useState<{ product: string; topic: string } | null>(null);

  // Extract unique products
  const productsList = useMemo(() => {
    const set = new Set(reviews.map((r) => r.productName).filter(Boolean));
    return Array.from(set);
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchProduct = selectedProduct === "all" || r.productName === selectedProduct;
      const matchSentiment = selectedSentiment === "all" || r.sentiment === selectedSentiment;
      let matchRating = true;
      if (selectedRating === "positive") matchRating = r.rating >= 4;
      else if (selectedRating === "negative") matchRating = r.rating <= 2;
      else if (selectedRating === "neutral") matchRating = r.rating === 3;

      return matchProduct && matchSentiment && matchRating;
    });
  }, [reviews, selectedProduct, selectedRating, selectedSentiment]);

  // Calculate grid cell values
  // Matrix keys: product_name + "::" + topic
  const cellMetrics = useMemo(() => {
    const metrics: Record<string, { count: number; sumRating: number; avgRating: number; positiveCount: number }> = {};

    // Initialize all pairs
    const activeProducts = selectedProduct === "all" ? productsList : [selectedProduct];
    activeProducts.forEach((p) => {
      TOPICS.forEach((t) => {
        metrics[`${p}::${t}`] = { count: 0, sumRating: 0, avgRating: 0, positiveCount: 0 };
      });
    });

    // Populate actual review matches
    filteredReviews.forEach((r) => {
      const p = r.productName;
      if (!p || !activeProducts.includes(p)) return;

      const topicsArray: string[] = JSON.parse(r.topics || "[]");
      topicsArray.forEach((t) => {
        // Standardize topic mapping
        const matchingTopic = TOPICS.find((topic) => topic.toLowerCase() === t.toLowerCase());
        if (!matchingTopic) return;

        const key = `${p}::${matchingTopic}`;
        if (!metrics[key]) {
          metrics[key] = { count: 0, sumRating: 0, avgRating: 0, positiveCount: 0 };
        }
        
        metrics[key].count++;
        metrics[key].sumRating += r.rating;
        if (r.sentiment === "positive") {
          metrics[key].positiveCount++;
        }
      });
    });

    // Compute averages
    Object.keys(metrics).forEach((key) => {
      const m = metrics[key];
      if (m.count > 0) {
        m.avgRating = parseFloat((m.sumRating / m.count).toFixed(1));
      }
    });

    return metrics;
  }, [filteredReviews, productsList, selectedProduct]);

  // Get cell color configurations
  const getCellBg = (count: number, avgRating: number) => {
    if (count === 0) return "bg-muted/10 border-border/20 text-muted-foreground/30";

    // Green (Low friction): rating > 3.8
    if (avgRating > 3.8) {
      if (count > 5) return "bg-emerald-500/40 text-emerald-950 dark:text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/50";
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/25";
    }

    // Yellow (Moderate friction): 2.5 to 3.8
    if (avgRating >= 2.5) {
      if (count > 5) return "bg-amber-500/45 text-amber-950 dark:text-amber-300 border-amber-500/50 hover:bg-amber-500/55";
      return "bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/25";
    }

    // Red (Critical friction): < 2.5
    if (count > 5) return "bg-red-500/45 text-red-950 dark:text-red-300 border-red-500/50 hover:bg-red-500/55";
    return "bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/25";
  };

  // Cell inspector statistics computed
  const inspectorData = useMemo(() => {
    if (!activeCell) return null;

    const cellReviews = filteredReviews.filter((r) => {
      if (r.productName !== activeCell.product) return false;
      const topicsArray: string[] = JSON.parse(r.topics || "[]");
      return topicsArray.some((t) => t.toLowerCase() === activeCell.topic.toLowerCase());
    });

    const sumRating = cellReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = cellReviews.length > 0 ? (sumRating / cellReviews.length).toFixed(1) : "0";
    const pos = cellReviews.filter((r) => r.sentiment === "positive").length;
    
    // Merge keywords
    const keywordsSet = new Set<string>();
    cellReviews.forEach((r) => {
      const kw: string[] = JSON.parse(r.keywords || "[]");
      kw.slice(0, 3).forEach((word) => keywordsSet.add(word));
    });

    // Auto-recommend actions
    let recommendations = "Monitor feedback pattern for further changes.";
    if (parseFloat(avgRating) <= 2.5) {
      if (activeCell.topic === "Quality") recommendations = "Escalate quality audit to manufacturing. Investigate structural stress points.";
      else if (activeCell.topic === "Software") recommendations = "Review Bluetooth buffer sizes and fix watch sync timeouts.";
      else if (activeCell.topic === "Support") recommendations = "Speed up customer claims resolution processes and train support agents.";
      else recommendations = "Hold urgent product optimization sprint addressing these customer points.";
    } else if (parseFloat(avgRating) < 4.0) {
      recommendations = "Schedule minor improvements update addressing UI/UX friction and small glitches.";
    } else {
      recommendations = "Leverage positive feedback in marketing assets and showcase feature strengths.";
    }

    return {
      reviewsList: cellReviews,
      avgRating,
      positivePercent: cellReviews.length > 0 ? Math.round((pos / cellReviews.length) * 100) : 0,
      keywords: Array.from(keywordsSet).slice(0, 8),
      recommendations,
    };
  }, [activeCell, filteredReviews]);

  const activeProducts = selectedProduct === "all" ? productsList.slice(0, 6) : [selectedProduct];

  return (
    <div className="space-y-6">
      {/* ─── Filters Row ─── */}
      <Card className="bg-card/50 backdrop-blur-md border-border/40">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          {/* Select Product */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Product Index</span>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[180px] h-9 rounded-lg bg-background/50">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productsList.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Rating */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Rating Tier</span>
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-[150px] h-9 rounded-lg bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="positive">Positive (4-5★)</SelectItem>
                <SelectItem value="neutral">Neutral (3★)</SelectItem>
                <SelectItem value="negative">Negative (1-2★)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Select Sentiment */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Sentiment Filter</span>
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger className="w-[150px] h-9 rounded-lg bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive Only</SelectItem>
                <SelectItem value="negative">Negative Only</SelectItem>
                <SelectItem value="neutral">Neutral Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ─── Heatmap Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Grid Cell blocks */}
        <Card className="lg:col-span-8 bg-card/50 backdrop-blur-md border-border/40 p-6 overflow-x-auto">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Grid size={16} className="text-purple-500" />
              Friction Concentration Heatmap
            </CardTitle>
            <CardDescription>Click any colored intersection grid cell to inspect reviews and auto-recommend actions.</CardDescription>
          </CardHeader>
          
          <div className="min-w-[600px] pt-4">
            {/* Grid structure */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${activeProducts.length}, 1fr)` }}>
              {/* Corner item header */}
              <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-end justify-start pb-2">Topic Component</div>
              
              {/* Product header titles */}
              {activeProducts.map((p) => (
                <div key={p} className="text-xs font-bold text-center text-foreground truncate px-1 pb-2 border-b border-border/20" title={p}>
                  {p}
                </div>
              ))}

              {/* Rows iteration */}
              {TOPICS.map((topic) => (
                <React.Fragment key={topic}>
                  {/* Left Label */}
                  <div className="text-xs font-semibold text-muted-foreground flex items-center pr-2 py-3 border-r border-border/20">
                    {topic}
                  </div>

                  {/* Matrix Cells */}
                  {activeProducts.map((prod) => {
                    const key = `${prod}::${topic}`;
                    const metrics = cellMetrics[key] || { count: 0, avgRating: 0 };
                    const isSelected = activeCell?.product === prod && activeCell?.topic === topic;

                    return (
                      <div
                        key={prod}
                        onClick={() => metrics.count > 0 && setActiveCell({ product: prod, topic })}
                        className={`border rounded-xl p-3 flex flex-col items-center justify-center min-h-[70px] cursor-pointer transition-all duration-200 ${
                          isSelected ? "ring-2 ring-purple-500 scale-[1.02]" : ""
                        } ${getCellBg(metrics.count, metrics.avgRating)}`}
                      >
                        {metrics.count > 0 ? (
                          <>
                            <span className="text-xs font-extrabold">{metrics.count} revs</span>
                            <span className="text-[10px] opacity-75 font-bold flex items-center gap-0.5 mt-1">
                              <Star size={9} className="fill-current" />
                              {metrics.avgRating}
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] opacity-50">-</span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-6 pt-6 mt-4 border-t border-border/20 text-[10px] font-bold text-muted-foreground uppercase justify-center">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500/15 border border-emerald-500/30" />
                <span>Low issues (&gt;3.8★)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500/15 border border-amber-500/30" />
                <span>Moderate (2.5 - 3.8★)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-red-500/15 border border-red-500/30" />
                <span>Critical (&lt;2.5★)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ─── Cell Drawer/Inspector Panel ─── */}
        <div className="lg:col-span-4 h-full">
          <AnimatePresence mode="wait">
            {activeCell && inspectorData ? (
              <motion.div
                key={`${activeCell.product}::${activeCell.topic}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <Card className="bg-card/50 backdrop-blur-md border-border/40 h-full flex flex-col">
                  {/* Inspector Header */}
                  <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-muted/20">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Intersection Inspector</span>
                      <h3 className="text-xs font-extrabold truncate text-foreground">{activeCell.product} — {activeCell.topic}</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setActiveCell(null)} className="h-8 w-8 rounded-lg hover:bg-muted/40">
                      <X size={15} />
                    </Button>
                  </div>

                  {/* Inspector Metrics */}
                  <CardContent className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-xl border border-border/30 bg-background/50">
                        <span className="text-[10px] text-muted-foreground block font-bold uppercase">Average Stars</span>
                        <span className="text-sm font-extrabold flex items-center justify-center gap-1 mt-1 text-foreground">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {inspectorData.avgRating} / 5.0
                        </span>
                      </div>
                      <div className="p-3 rounded-xl border border-border/30 bg-background/50">
                        <span className="text-[10px] text-muted-foreground block font-bold uppercase">Positive Pct</span>
                        <span className="text-sm font-extrabold flex items-center justify-center gap-1 mt-1 text-emerald-500">
                          <ThumbsUp size={12} />
                          {inspectorData.positivePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Extracted keywords */}
                    {inspectorData.keywords.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={11} className="text-purple-500" />
                          Concentrated Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {inspectorData.keywords.map((k) => (
                            <Badge key={k} variant="secondary" className="bg-background border border-border/40 text-[9px] px-2 py-0">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Recommendation */}
                    <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-1">
                      <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench size={11} />
                        Recommended Action Plan
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {inspectorData.recommendations}
                      </p>
                    </div>

                    {/* Sample reviews list */}
                    <div className="space-y-2 border-t border-border/20 pt-3">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        Sample Reviews ({inspectorData.reviewsList.length})
                      </h4>
                      
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {inspectorData.reviewsList.slice(0, 3).map((r) => (
                          <div key={r.id} className="p-2.5 rounded-xl bg-background/50 border border-border/30 space-y-1">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="font-bold text-foreground">{r.author}</span>
                              <span className={`font-bold flex items-center gap-0.5 ${r.sentiment === "positive" ? "text-emerald-500" : r.sentiment === "negative" ? "text-red-500" : "text-slate-400"}`}>
                                {r.rating}★
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                              "{r.content.slice(0, 100)}..."
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-card/50 backdrop-blur-md border-border/40 h-[300px] flex flex-col items-center justify-center text-center p-6">
                <Info size={32} className="text-muted-foreground/35 mb-2.5 animate-pulse" />
                <h4 className="text-xs font-bold text-foreground">No Cell Selected</h4>
                <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
                  Select any intersection cell with review metrics to launch review details drawer.
                </p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
