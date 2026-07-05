import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Sparkles, BrainCircuit, Star, AlertCircle, FileText, CheckCircle2,
  Trash2, RefreshCw, ChevronRight, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface UploadViewProps {
  onManualSubmit: (review: { author: string; rating: number; content: string; productName: string }) => Promise<void>;
  onCSVSubmit: (reviews: Array<{ author: string; rating: number; content: string; productName: string }>) => Promise<void>;
}

export default function UploadView({ onManualSubmit, onCSVSubmit }: UploadViewProps) {
  // Manual form states
  const [author, setAuthor] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // CSV Drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvReviews, setCsvReviews] = useState<Array<{ author: string; rating: number; content: string; productName: string }>>([]);
  const [submittingCSV, setSubmittingCSV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = async () => {
    if (!author.trim() || !content.trim()) {
      toast.error("Please fill in author name and review content.");
      return;
    }
    setSubmittingManual(true);
    try {
      await onManualSubmit({ author, rating, content, productName });
      setAuthor("");
      setProductName("");
      setRating(5);
      setContent("");
      toast.success("Review submitted and successfully analyzed by AI!");
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmittingManual(false);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        await processCSVFile(file);
      } else {
        toast.error("Invalid file format. Only CSV files are supported.");
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processCSVFile(e.target.files[0]);
    }
  };

  const processCSVFile = async (file: File) => {
    setFileName(file.name);
    setUploadProgress(10);
    
    try {
      const text = await file.text();
      setUploadProgress(40);
      
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV file is empty or missing content rows.");
        resetCSVState();
        return;
      }
      
      setUploadProgress(60);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const parsedReviews: Array<{ author: string; rating: number; content: string; productName: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });

        const reviewContent = row.content || "";
        const reviewRating = parseInt(row.rating || "0");

        if (reviewContent && !isNaN(reviewRating) && reviewRating > 0) {
          parsedReviews.push({
            author: row.author || "Anonymous",
            rating: reviewRating,
            content: reviewContent,
            productName: row.product || row.productname || "Unknown Product",
          });
        }
      }

      setUploadProgress(90);
      
      if (parsedReviews.length === 0) {
        toast.error("Could not parse any valid reviews. Ensure 'content' and 'rating' columns exist.");
        resetCSVState();
        return;
      }

      setTimeout(() => {
        setUploadProgress(100);
        setCsvReviews(parsedReviews);
        toast.success(`Successfully parsed ${parsedReviews.length} reviews from CSV!`);
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error("An error occurred while parsing the CSV file.");
      resetCSVState();
    }
  };

  const resetCSVState = () => {
    setFileName(null);
    setUploadProgress(null);
    setCsvReviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportCSV = async () => {
    if (csvReviews.length === 0) return;
    setSubmittingCSV(true);
    try {
      await onCSVSubmit(csvReviews);
      toast.success(`Successfully imported and analyzed all ${csvReviews.length} reviews!`);
      resetCSVState();
    } catch {
      toast.error("Failed to import reviews. Please try again.");
    } finally {
      setSubmittingCSV(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ─── Left Side: Manual review form ─── */}
      <Card className="lg:col-span-5 bg-card/50 backdrop-blur-md border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            Add Single Review
          </CardTitle>
          <CardDescription>
            Insert review details and let ReviewLens analyze sentiment, score confidence, and index keywords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Author Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Author</label>
            <Input
              placeholder="e.g. Sarah Connor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="h-10 rounded-xl bg-background/60"
            />
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Product Name</label>
            <Input
              placeholder="e.g. FitBand Ultra watch"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-10 rounded-xl bg-background/60"
            />
          </div>

          {/* Star Rating Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Review Star Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    className={`transition-colors ${
                      star <= (hoverRating ?? rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/20"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-muted-foreground ml-2">{rating} out of 5 stars</span>
            </div>
          </div>

          {/* Review text area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Comments / Content</label>
            <Textarea
              placeholder="Write customer review text... (The longer the content, the more keywords and topic tags can be parsed)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="rounded-xl resize-none bg-background/60"
            />
          </div>

          {/* Submit button */}
          <Button
            onClick={handleManualSubmit}
            disabled={submittingManual || !author.trim() || !content.trim()}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20"
          >
            {submittingManual ? (
              <>
                <RefreshCw size={14} className="mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <BrainCircuit size={14} className="mr-2" />
                Analyze & Submit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ─── Right Side: CSV drag drop + preview zone ─── */}
      <Card className="lg:col-span-7 bg-card/50 backdrop-blur-md border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Upload size={16} className="text-purple-500" />
            Bulk CSV Upload
          </CardTitle>
          <CardDescription>
            Import multiple reviews at once. CSV must include headers: <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">author</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">rating</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">content</code>, and <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">product</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop File Zone */}
          {uploadProgress === null ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition-colors p-4 ${
                dragActive
                  ? "border-purple-500 bg-purple-500/5 text-purple-600"
                  : "border-border/60 hover:border-purple-500/40 hover:bg-muted/10 text-muted-foreground"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-muted/40 mb-3 text-muted-foreground">
                <Upload size={24} />
              </div>
              <p className="text-sm font-bold text-foreground">Click to upload CSV or drag and drop</p>
              <p className="text-[10px] text-muted-foreground mt-1">Accepts CSV files with up to 100 rows</p>
            </div>
          ) : (
            /* Upload Progress state */
            <div className="border border-border/40 rounded-xl p-4 space-y-4 bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-purple-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate max-w-[200px]">{fileName}</p>
                    <p className="text-[10px] text-muted-foreground">{csvReviews.length > 0 ? "Parsing complete" : "Uploading & parsing..."}</p>
                  </div>
                </div>
                {uploadProgress === 100 && (
                  <Button variant="ghost" size="icon" onClick={resetCSVState} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 size={13} />
                  </Button>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>Progress</span>
                  <span className="font-bold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            </div>
          )}

          {/* CSV parsed rows preview */}
          {csvReviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold">{csvReviews.length} reviews parsed successfully</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Previewing first 3 rows</span>
              </div>

              {/* Preview table */}
              <div className="border border-border/40 rounded-lg overflow-hidden bg-background/50">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/40 text-muted-foreground font-semibold">
                      <th className="p-2">Author</th>
                      <th className="p-2">Product</th>
                      <th className="p-2">Rating</th>
                      <th className="p-2">Content Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvReviews.slice(0, 3).map((r, idx) => (
                      <tr key={idx} className="border-b border-border/20 last:border-none">
                        <td className="p-2 font-bold truncate max-w-[80px]">{r.author}</td>
                        <td className="p-2 truncate max-w-[100px]">{r.productName}</td>
                        <td className="p-2 text-amber-500 font-semibold">{r.rating}★</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[200px]">{r.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Action Trigger */}
              <Button
                onClick={handleImportCSV}
                disabled={submittingCSV}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/25"
              >
                {submittingCSV ? (
                  <>
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    AI Analyzing & Saving {csvReviews.length} Reviews...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={14} className="mr-2" />
                    Import & AI-Analyze {csvReviews.length} Reviews
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── CSV Parser helper ───
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
