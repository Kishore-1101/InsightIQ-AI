import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit, Sparkles, TrendingUp, ThumbsDown, ThumbsUp, AlertCircle,
  Wrench, Rocket, RefreshCw, BarChart, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";

interface Complaint {
  topic: string;
  complaint: string;
  count: number;
  recommendation: string;
}

interface LovedFeature {
  feature: string;
  praise: string;
  count: number;
}

interface Suggestion {
  area: string;
  details: string;
}

interface BusinessRec {
  category: string;
  plan: string;
  impact: "High" | "Medium" | "Low";
}

interface InsightsData {
  executiveSummary: string;
  topComplaints: Complaint[];
  mostLovedFeatures: LovedFeature[];
  improvementSuggestions: Suggestion[];
  businessRecommendations: BusinessRec[];
}

export default function InsightsView() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400";
      default:
        return "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Card className="bg-card/40 border-border/40 p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Executive Briefing</h2>
          <p className="text-xs text-muted-foreground">Strategic analysis based on latest parsed review patterns</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
          className="h-10 px-4 rounded-xl border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/5 gap-2"
        >
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : "Regenerate Analysis"}
        </Button>
      </div>

      {/* ─── Executive Summary ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-card/60 border-border/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full" />
          <CardContent className="p-6 md:p-8 flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500 shrink-0 hidden sm:flex">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500 sm:hidden" />
                <h3 className="text-sm font-bold tracking-tight">Executive Summary</h3>
                <Badge className="bg-purple-500 text-white text-[9px] hover:bg-purple-500 border-none font-bold">AI Synthesized</Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                {data?.executiveSummary || "No insights parsed. Insert review data to load summary summaries."}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Complaints & Loved Features Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Complaints (Accordion) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="lg:col-span-6"
        >
          <Card className="bg-card/50 backdrop-blur-md border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ThumbsDown size={16} className="text-red-500" />
                Top Customer Friction Points
              </CardTitle>
              <CardDescription>Major recurring complaints and product mitigations</CardDescription>
            </CardHeader>
            <CardContent>
              {data && data.topComplaints.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {data.topComplaints.map((item, idx) => (
                    <AccordionItem key={idx} value={`complaint-${idx}`} className="border-border/30">
                      <AccordionTrigger className="hover:no-underline hover:bg-muted/30 px-3 py-3.5 rounded-lg text-xs font-bold text-left transition-colors">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="truncate">{item.topic}</span>
                          <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15 border-none text-[10px] font-bold">
                            {item.count} mentions
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 pt-2 space-y-3">
                        <p className="text-xs text-muted-foreground bg-background/50 border border-border/30 p-2.5 rounded-xl leading-relaxed">
                          <strong className="text-foreground">Friction detail:</strong> {item.complaint}
                        </p>
                        <div className="flex gap-2 p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs">
                          <Wrench size={14} className="text-purple-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-foreground">Action recommendation:</span>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.recommendation}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <AlertCircle size={24} className="mb-2 opacity-40" />
                  No significant friction points detected.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Most Loved Features (Grid) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="lg:col-span-6"
        >
          <Card className="bg-card/50 backdrop-blur-md border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ThumbsUp size={16} className="text-emerald-500" />
                Value Props & loved Features
              </CardTitle>
              <CardDescription>Aspects highly praised by customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data && data.mostLovedFeatures.length > 0 ? (
                data.mostLovedFeatures.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border/40 bg-muted/10 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                      <ThumbsUp size={14} />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold truncate">{item.feature}</span>
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[9px] px-1.5 py-0 border-emerald-500/10 font-bold shrink-0">
                          {item.count} mentions
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.praise}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <AlertCircle size={24} className="mb-2 opacity-40" />
                  No high-praise features detected.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Business Recommendations Grid ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Rocket size={16} className="text-purple-500" />
              Strategic Business Recommendations
            </CardTitle>
            <CardDescription>AI recommendations for executive execution plans</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {data && data.businessRecommendations.length > 0 ? (
              data.businessRecommendations.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/40 bg-background/50 hover:border-purple-500/10 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.category}</span>
                      <Badge variant="outline" className={`${getImpactBadge(item.impact)} text-[9px] px-1.5 py-0 border font-bold shrink-0`}>
                        {item.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {item.plan}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:opacity-85 cursor-pointer">
                    <span>Draft action plan</span>
                    <ArrowRight size={10} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center text-xs text-muted-foreground">
                No business recommendations generated.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
