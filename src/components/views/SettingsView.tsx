import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Settings, User, Key, Bell, Shield, Sun, Moon, Laptop,
  Copy, Check, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  
  // Profile settings state
  const [profileName, setProfileName] = useState("Kishore Kumar");
  const [profileRole, setProfileRole] = useState("CX Lead Analytics");
  const [profileCompany, setProfileCompany] = useState("ReviewLens Inc.");

  // API Key Management state
  const [apiKey, setApiKey] = useState("sk_live_51Pz7R...8fK3d9");
  const [showKey, setShowKey] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Notification preferences states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [negReviewAlerts, setNegReviewAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const generateNewKey = () => {
    setGenerating(true);
    setTimeout(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let keyTail = "";
      for (let i = 0; i < 16; i++) {
        keyTail += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setApiKey(`sk_live_dev_${keyTail}`);
      setGenerating(false);
      toast.success("New production API Key generated successfully!");
    }, 800);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API key copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* ─── Left Side: Settings Nav Info Cards ─── */}
      <div className="md:col-span-4 space-y-4">
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Settings size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Settings Hub</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Customize dashboard layout preferences, configure email notification intervals, edit team roles, and generate external API endpoints keys.
            </p>
          </CardContent>
        </Card>

        {/* Short Security disclaimer */}
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Shield size={14} className="text-purple-500" />
              <span>Developer API Sandbox</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Use generated secret keys to securely fetch database analytics aggregates via external workflows or integrate alerts inside your Slack channels.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Right Side: Main Config Panels ─── */}
      <div className="md:col-span-8 space-y-6">
        {/* Panel 1: Team profile */}
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User size={16} className="text-purple-500" />
              Team Profile Profile
            </CardTitle>
            <CardDescription>Configure user profiles for reporting references</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Full Name</label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="h-10 rounded-xl bg-background/50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Corporate Role</label>
                <Input
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="h-10 rounded-xl bg-background/50 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Company Entity</label>
              <Input
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                className="h-10 rounded-xl bg-background/50 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: Theme picker */}
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sun size={16} className="text-purple-500" />
              Interface Theme Selection
            </CardTitle>
            <CardDescription>Switch theme preference for dashboard render</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light Mode", icon: Sun },
                { id: "dark", label: "Dark Mode", icon: Moon },
                { id: "system", label: "System Sync", icon: Laptop },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/5 text-purple-600 dark:text-purple-400 font-bold"
                        : "border-border/40 hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel 3: API Key Generator */}
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Key size={16} className="text-purple-500" />
              API Key Management
            </CardTitle>
            <CardDescription>Integrate client review queries inside developer hooks</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="h-10 rounded-xl bg-background/50 font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyKey}
                className="h-10 w-10 rounded-xl border-border/40"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={generateNewKey}
              disabled={generating}
              className="rounded-xl h-10 px-4 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/5 font-semibold gap-2"
            >
              <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
              {generating ? "Generating..." : "Roll New Secret Key"}
            </Button>
          </CardContent>
        </Card>

        {/* Panel 4: Email preferences */}
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bell size={16} className="text-purple-500" />
              Alert & Notification Preferences
            </CardTitle>
            <CardDescription>Configure analytical digests and warnings intervals</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs font-medium">
            <div className="space-y-3">
              {/* Check 1 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-0.5 rounded border-border/60 text-purple-500 focus:ring-purple-500"
                />
                <div className="space-y-0.5">
                  <p className="text-foreground group-hover:text-purple-600 transition-colors">Critical Sentiment Notifications</p>
                  <p className="text-[10px] text-muted-foreground">Receive instant alerts when overall average ratings fall below 4.0 stars.</p>
                </div>
              </label>

              {/* Check 2 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={negReviewAlerts}
                  onChange={(e) => setNegReviewAlerts(e.target.checked)}
                  className="mt-0.5 rounded border-border/60 text-purple-500 focus:ring-purple-500"
                />
                <div className="space-y-0.5">
                  <p className="text-foreground group-hover:text-purple-600 transition-colors">Negative Review warnings</p>
                  <p className="text-[10px] text-muted-foreground">Notify Slack or email when negative reviews with confidence &gt; 90% are parsed.</p>
                </div>
              </label>

              {/* Check 3 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="mt-0.5 rounded border-border/60 text-purple-500 focus:ring-purple-500"
                />
                <div className="space-y-0.5">
                  <p className="text-foreground group-hover:text-purple-600 transition-colors">Weekly Analytical Summary Briefs</p>
                  <p className="text-[10px] text-muted-foreground">A consolidated PDF report sent every Monday summarizing NPS score trends.</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
