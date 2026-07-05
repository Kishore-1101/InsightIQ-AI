import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, BrainCircuit, RefreshCw, Key, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; email: string; role: string; company: string }) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all credential fields.");
      return;
    }

    setLoading(true);

    // Simulate database credentials verify latency
    setTimeout(() => {
      setLoading(false);
      if (email.toLowerCase() === "admin@reviewlens.com" && password === "password123") {
        const mockUser = {
          name: "Kishore Kumar",
          email: "admin@reviewlens.com",
          role: "CX Lead Analytics",
          company: "ReviewLens Inc.",
        };
        onLoginSuccess(mockUser);
        toast.success(`Welcome back, ${mockUser.name}!`);
      } else {
        toast.error("Invalid email or password combination. Try the sample credentials!");
      }
    }, 1000);
  };

  const autofillSampleCredentials = () => {
    setEmail("admin@reviewlens.com");
    setPassword("password123");
    toast.info("Sample credentials loaded. Click Sign In!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background ambient gradient highlights */}
      <div className="absolute top-0 left-0 -translate-y-12 translate-x-12 w-[350px] h-[350px] bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-y-12 -translate-x-12 w-[350px] h-[350px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="bg-card/50 backdrop-blur-xl border-border/40 shadow-xl overflow-hidden rounded-3xl">
          {/* Accent border stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />
          
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 mb-3">
              <BrainCircuit size={24} className="animate-pulse" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">ReviewLens Enterprise</CardTitle>
            <CardDescription className="text-xs">Sign in to access your AI customer insights dashboard</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="e.g. admin@reviewlens.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-background/60 text-xs"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-muted-foreground">Password</label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-medium">Forgot?</span>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 rounded-xl bg-background/60 text-xs"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 pt-0.5"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Quick Demo Autofill Hint */}
            <div className="p-3 border border-purple-500/10 bg-purple-500/5 rounded-2xl flex items-start gap-2.5 text-xs text-muted-foreground">
              <Key size={16} className="text-purple-500 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <span className="font-bold text-foreground leading-none">Quick Sandbox Access:</span>
                <p className="text-[10px] leading-relaxed">
                  Use email: <code className="bg-background px-1 py-0.5 rounded font-mono font-bold text-purple-600 dark:text-purple-400">admin@reviewlens.com</code> / pass: <code className="bg-background px-1 py-0.5 rounded font-mono font-bold text-purple-600 dark:text-purple-400">password123</code>.
                </p>
                <button
                  onClick={autofillSampleCredentials}
                  className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 mt-1"
                >
                  Autofill Credentials
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
