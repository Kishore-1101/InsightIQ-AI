import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, UserCircle, RefreshCw, MessageSquare, BrainCircuit,
  ArrowRight, Sparkles, Database, HelpCircle, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am your ReviewLens AI Agent. I have full semantic access to all custom reviews stored in the database. Ask me specific analytical questions — for instance, you could try: \"Summarize negative feedback for headphones\" or \"Which product has the highest overall sentiment index and why?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;
    
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Failed to query: ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Apologies, the server encountered an error parsing database reviews. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. What can I help you analyze from the customer feedback records today?",
      },
    ]);
  };

  const suggestions = [
    { text: "What are the top customer complaints?", desc: "Identifies major product flaws" },
    { text: "Which product has the best rating and why?", desc: "Examines highest satisfaction drivers" },
    { text: "Summarize negative reviews for headphones", desc: "Drill down on audio feedback" },
    { text: "What action items do you recommend?", desc: "Suggests business optimizations" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-170px)] items-stretch">
      {/* Left panel: Quick queries */}
      <Card className="lg:col-span-4 bg-card/50 backdrop-blur-md border-border/40 flex flex-col h-full overflow-hidden">
        <CardHeader className="shrink-0 pb-3 border-b border-border/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <HelpCircle size={16} className="text-purple-500" />
            Quick Prompts
          </CardTitle>
          <CardDescription>Click any quick prompt to query the AI agent instantly</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.text)}
              disabled={loading}
              className="w-full text-left p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-all hover:border-purple-500/10 hover:shadow-sm flex items-start gap-3 group disabled:opacity-50"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <MessageSquare size={13} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                  {item.text}
                </p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
          
          <div className="pt-4 border-t border-border/20 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <Database size={11} className="text-purple-500" />
              <span>Semantic context</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              ReviewLens AI scans product names, reviews content, ratings, and classifications in real-time to answer complex analytical business queries.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right panel: Full chat area */}
      <Card className="lg:col-span-8 bg-card/50 backdrop-blur-md border-border/40 flex flex-col h-full overflow-hidden">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-muted/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <BrainCircuit size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold leading-none text-foreground">Semantic Analytics Chat</h3>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1 leading-none font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Context synced
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={loading}
            className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            Clear Thread
          </Button>
        </div>

        {/* Scrollable messages container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-background/20">
          {messages.map((msg, i) => {
            const isAI = msg.role === "assistant";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* User or AI icon avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isAI
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                }`}>
                  {isAI ? <Bot size={15} /> : <UserCircle size={15} />}
                </div>

                {/* Text bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed border shadow-sm ${
                  isAI
                    ? "bg-card text-foreground rounded-tl-none border-border/40"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-tr-none border-purple-500/10"
                }`}>
                  {msg.content.split("\n").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line.startsWith("- ") || line.startsWith("* ") || /^\d+\./.test(line) ? (
                        <span className="flex items-start gap-1.5 my-1">
                          <span className="shrink-0 mt-1 text-purple-500">•</span>
                          <span>{line.replace(/^[-*]\s+|^\d+\.\s+/, "")}</span>
                        </span>
                      ) : (
                        <span>{line}</span>
                      )}
                      {idx < msg.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Loader thinking bubble */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="p-3 bg-card border border-border/40 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-border/20 bg-background shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the customer reviews in the database..."
              disabled={loading}
              className="flex-1 h-11 px-4 text-xs bg-muted/40 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-50 transition-all placeholder:text-muted-foreground/50"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20"
            >
              <Send size={15} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
