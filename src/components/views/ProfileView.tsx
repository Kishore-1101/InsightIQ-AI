import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Briefcase, Building, FileText, CheckCircle2,
  Database, Shield, LogOut, Award, Calendar, Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  reviewCount: number;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
];

export default function ProfileView({ user, onUpdateUser, onLogout, reviewCount }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [company, setCompany] = useState(user.company);
  const [bio, setBio] = useState(user.bio || "Optimizing customer experience journeys and scaling review indexing parameters.");
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl || AVATARS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onUpdateUser({
        name,
        email,
        role,
        company,
        bio,
        avatarUrl: selectedAvatar,
      });
      setSaving(false);
      toast.success("Profile updates saved successfully!");
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ─── Left Side: Profile Summary & Stats ─── */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-card/50 backdrop-blur-md border-border/40 overflow-hidden text-center p-6">
          <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/40 p-1 mb-4">
            <img src={selectedAvatar} alt="Profile Avatar" className="w-full h-full rounded-full object-cover" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">{user.name}</h3>
            <p className="text-xs text-muted-foreground">{user.role}</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">{user.company}</p>
          </div>

          <div className="flex justify-center gap-1.5 mt-3.5">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-none text-[9px] px-2 font-bold py-0.5">
              <Award size={9} className="mr-1" />
              Pro Tier
            </Badge>
            <Badge variant="outline" className="text-[9px] border-border/40 px-2 py-0.5 font-bold">
              Active
            </Badge>
          </div>

          <p className="text-[11px] text-muted-foreground italic leading-relaxed mt-4 border-t border-border/20 pt-4">
            "{user.bio || bio}"
          </p>
        </Card>

        {/* Analytics stats */}
        <Card className="bg-card/50 backdrop-blur-md border-border/40 p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Database size={13} className="text-purple-500" />
            Account Usage Metrics
          </h4>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block font-medium">Reviews Saved</span>
              <span className="text-lg font-extrabold text-foreground">{reviewCount}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block font-medium">Queries Run</span>
              <span className="text-lg font-extrabold text-foreground">128</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[10px] text-muted-foreground flex items-center gap-2">
            <Shield size={13} className="text-purple-500 shrink-0" />
            <span>Authorized by Corporate Security SSO</span>
          </div>
        </Card>
      </div>

      {/* ─── Right Side: Account settings form ─── */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="bg-card/50 backdrop-blur-md border-border/40">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User size={16} className="text-purple-500" />
              Manage Account Information
            </CardTitle>
            <CardDescription>Edit personal credentials and choose display avatar</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Avatar Select list */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-muted-foreground">Select Display Avatar</label>
              <div className="flex gap-3">
                {AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 hover:scale-105 ${
                      selectedAvatar === av
                        ? "border-purple-500 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={av} alt="Avatar option" className="w-full h-full rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* General form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-background/50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-background/50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Job Title</label>
                <div className="relative">
                  <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-background/50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Company Entity</label>
                <div className="relative">
                  <Building size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-background/50 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Account biography */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Account Biography</label>
              <div className="relative">
                <FileText size={13} className="absolute left-3 top-3 text-muted-foreground" />
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="pl-9 rounded-xl bg-background/50 text-xs resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/20 gap-3 flex-wrap">
              <Button
                onClick={handleSave}
                disabled={saving || !name.trim() || !email.trim()}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 gap-2"
              >
                <Save size={14} />
                {saving ? "Saving changes..." : "Save Details"}
              </Button>

              <Button
                variant="ghost"
                onClick={onLogout}
                className="h-10 px-5 rounded-xl hover:bg-destructive/10 hover:text-destructive gap-1.5 text-muted-foreground font-semibold"
              >
                <LogOut size={14} />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
