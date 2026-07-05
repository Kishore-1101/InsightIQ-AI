import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, ThumbsUp, ThumbsDown, Minus, Trash2, Tag,
  ChevronDown, ChevronUp, AlertCircle, RefreshCw, Calendar, Globe, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface ReviewsViewProps {
  reviews: Review[];
  onDelete: (id: string) => void;
  products: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterSentiment: string;
  setFilterSentiment: (sentiment: string) => void;
  filterProduct: string;
  setFilterProduct: (product: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function ReviewsView({
  reviews,
  onDelete,
  products,
  searchQuery,
  setSearchQuery,
  filterSentiment,
  setFilterSentiment,
  filterProduct,
  setFilterProduct,
  sortBy,
  setSortBy
}: ReviewsViewProps) {
  // Pagination & Row Expansion states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered & Sorted reviews
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.author.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          (r.productName && r.productName.toLowerCase().includes(q))
      );
    }

    // Sentiment filter
    if (filterSentiment !== "all") {
      result = result.filter((r) => r.sentiment === filterSentiment);
    }

    // Product filter
    if (filterProduct !== "all") {
      result = result.filter((r) => r.productName === filterProduct);
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "rating-high") {
        return b.rating - a.rating;
      } else if (sortBy === "rating-low") {
        return a.rating - b.rating;
      }
      return 0;
    });

    return result;
  }, [reviews, searchQuery, filterSentiment, filterProduct, sortBy]);

  // Paginated reviews
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedReviews.slice(start, start + pageSize);
  }, [processedReviews, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(processedReviews.length / pageSize));

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSentiment, filterProduct, sortBy, pageSize]);

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return {
          icon: ThumbsUp,
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        };
      case "negative":
        return {
          icon: ThumbsDown,
          bg: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
        };
      default:
        return {
          icon: Minus,
          bg: "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Filter Panel ─── */}
      <Card className="bg-card/50 backdrop-blur-md border-border/40">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search author, content, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-background/60"
            />
          </div>

          {/* Sentiment Dropdown */}
          <Select value={filterSentiment} onValueChange={setFilterSentiment}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-background/60">
              <SelectValue placeholder="All Sentiments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>

          {/* Product Dropdown */}
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background/60">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="rating-high">Rating: High-Low</SelectItem>
              <SelectItem value="rating-low">Rating: Low-High</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ─── Reviews Data Table ─── */}
      <Card className="bg-card/50 backdrop-blur-md border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground">
                <th className="w-10"></th>
                <th className="text-left py-3.5 px-4 font-semibold">Author</th>
                <th className="text-left py-3.5 px-4 font-semibold">Rating</th>
                <th className="text-left py-3.5 px-4 font-semibold">Product</th>
                <th className="text-left py-3.5 px-4 font-semibold">Sentiment</th>
                <th className="text-left py-3.5 px-4 font-semibold hidden md:table-cell">Source</th>
                <th className="text-left py-3.5 px-4 font-semibold hidden sm:table-cell">Date</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.map((review) => {
                const isExpanded = !!expandedRows[review.id];
                const styles = getSentimentStyles(review.sentiment);
                const Icon = styles.icon;
                const topics: string[] = JSON.parse(review.topics || "[]");
                const keywords: string[] = JSON.parse(review.keywords || "[]");

                return (
                  <React.Fragment key={review.id}>
                    {/* Row Content */}
                    <tr
                      onClick={() => toggleRow(review.id)}
                      className={`hover:bg-muted/30 cursor-pointer border-b border-border/20 transition-colors ${
                        isExpanded ? "bg-muted/10" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-4 text-center">
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                            {review.author.charAt(0)}
                          </div>
                          <span className="truncate max-w-[120px]">{review.author}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={11}
                              className={
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              }
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium max-w-[150px] truncate">
                        {review.productName || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`${styles.bg} border rounded-full px-2.5 gap-1 capitalize font-medium text-xs`}>
                          <Icon size={11} />
                          {review.sentiment}
                          <span className="opacity-60 text-[10px]">
                            ({Math.round(review.confidence * 100)}%)
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-muted-foreground capitalize">
                        <Badge variant="secondary" className="bg-muted text-[10px]">
                          <Globe size={9} className="mr-1" />
                          {review.source}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(review.id);
                          }}
                          className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <tr className="bg-muted/10 border-b border-border/20">
                        <td colSpan={8} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 py-4 space-y-3 overflow-hidden text-xs"
                          >
                            {/* Complete Content */}
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Feedback Content</h4>
                              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl bg-background/50 border border-border/30 rounded-xl p-3">
                                {review.content}
                              </p>
                            </div>

                            {/* Meta Badges */}
                            <div className="flex flex-wrap items-center gap-6 pt-1">
                              {/* Topics */}
                              {topics.length > 0 && topics[0] !== "General" && (
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1">
                                    <Tag size={12} />
                                    Categorized Topics
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {topics.map((t) => (
                                      <Badge key={t} variant="outline" className="bg-purple-500/5 text-[9px] px-2 py-0 border-purple-500/10">
                                        {t}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Keywords */}
                              {keywords.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1">
                                    <Sparkles size={12} />
                                    Keywords Extracted
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {keywords.map((k) => (
                                      <Badge key={k} variant="secondary" className="bg-background text-[9px] px-2 py-0">
                                        {k}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Empty state */}
              {processedReviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <AlertCircle size={36} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-semibold text-muted-foreground">No matches found</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      Adjust your search strings or filter configurations.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="px-4 py-3.5 border-t border-border/40 flex items-center justify-between flex-wrap gap-3 text-xs bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-background border border-border/40 rounded px-1.5 py-0.5 outline-none font-medium focus:ring-1 focus:ring-purple-500"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
            <span className="ml-4 hidden sm:inline">
              Showing {processedReviews.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, processedReviews.length)} of {processedReviews.length} records
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              &lt;
            </Button>
            <span className="px-3 py-1 bg-background border border-border/40 rounded-lg font-semibold">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              &gt;
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
