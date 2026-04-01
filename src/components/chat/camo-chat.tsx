"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatContext } from "./chat-context";

/**
 * Camo Chat Widget - AI assistant for Zikit.
 * Floating chat bubble in bottom-right corner.
 * Uses OpenAI API for responses about the product.
 */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const WELCOME = {
  content: "Hey! I'm Camo, your monitoring assistant. Ask me anything about Zikit!",
  actions: ["How does it work?", "What can I monitor?", "Show me pricing"],
};

export function CamoChatWidget() {
  const { pageContext, setPageContext } = useChatContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear messages when switching monitors
  useEffect(() => {
    setMessages([]);
  }, [pageContext.monitorName]);

  // Clear context when URL changes away from a monitor page
  useEffect(() => {
    const checkUrl = () => {
      if (!window.location.pathname.includes("/monitors/") || window.location.pathname.endsWith("/monitors") || window.location.pathname.endsWith("/monitors/new")) {
        if (pageContext.monitorName) {
          setPageContext({});
        }
      }
    };
    // Check on navigation
    const interval = setInterval(checkUrl, 1000);
    return () => clearInterval(interval);
  }, [pageContext.monitorName, setPageContext]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          pageContext,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "Sorry, I couldn't process that. Try again!",
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Oops, something went wrong. Try again in a moment!",
          timestamp: Date.now(),
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-primary/30 hover:scale-110 transition-transform overflow-hidden"
        >
          <Image src="/assets/camo-chat-bubble.png" alt="Chat with Camo" width={56} height={56} className="w-full h-full object-cover" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-border/50 flex flex-col bg-card">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-primary/10">
            <Image src="/assets/camo-happy.png" alt="" width={32} height={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Camo</p>
              {pageContext.monitorName ? (
                <p className="text-[10px] text-primary truncate">Watching: {pageContext.monitorName}</p>
              ) : (
                <p className="text-[10px] text-muted-foreground">Your monitoring assistant</p>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Image src="/assets/camo-happy.png" alt="" width={24} height={24} className="mt-1 flex-shrink-0" />
                  <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
                    {WELCOME.content}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-8">
                  {WELCOME.actions.map((a) => (
                    <button
                      key={a}
                      onClick={() => sendMessage(a)}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <Image src="/assets/camo-happy.png" alt="" width={24} height={24} className="mt-1 flex-shrink-0" />
                )}
                <div dir="auto" className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/50 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <Image src="/assets/camo-watch.png" alt="" width={24} height={24} className="mt-1 flex-shrink-0 animate-pulse" />
                <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-3 py-2.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/30 p-3">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-[9px] text-muted-foreground hover:text-foreground mb-2 block"
              >
                Clear chat
              </button>
            )}
            <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask Camo anything..."
              className="text-base"
              disabled={loading}
              dir="auto"
            />
            <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
