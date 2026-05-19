import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, X, Send, Loader2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

function parseIntent(text: string): { type: "suggest" | "trends" | "unknown"; query: string; category: string; condition: string } {
  const lower = text.toLowerCase();
  if (lower.includes("suggest") || lower.includes("listing") || lower.includes("create") || lower.includes("write")) {
    const title = text.replace(/suggest|listing|create|write|for|a|an/gi, "").trim() || text;
    return { type: "suggest", query: title, category: "Figures", condition: "New" };
  }
  if (lower.includes("trend") || lower.includes("price") || lower.includes("market") || lower.includes("worth")) {
    const query = text.replace(/trend|price|market|worth|what are|how much|is/gi, "").trim() || text;
    return { type: "trends", query, category: "Figures", condition: "New" };
  }
  return { type: "unknown", query: text, category: "Other", condition: "New" };
}

export default function AIAssistant() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(m => (m.length === 0 ? [{ role: "assistant", content: t("ai.greeting") }] : m));
  }, [t]);

  const suggestMutation = trpc.ai.listingSuggest.useMutation();
  const trendsQuery = trpc.ai.trends.useQuery(
    { query: "anime figures" },
    { enabled: false }
  );

  const addMsg = (role: "user" | "assistant", content: string) =>
    setMessages(prev => [...prev, { role, content }]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    addMsg("user", text);
    setIsLoading(true);

    try {
      const intent = parseIntent(text);

      if (intent.type === "suggest") {
        addMsg("assistant", t("ai.suggest"));
        const result = await suggestMutation.mutateAsync({
          title: intent.query,
          category: intent.category,
          condition: intent.condition,
        });
        addMsg("assistant", t("ai.listingResult", {
          title: result.title,
          description: result.description,
          price: result.suggestedPrice?.toFixed(2) ?? "0.00",
          category: result.category,
          condition: result.condition,
        }));
      } else if (intent.type === "trends") {
        addMsg("assistant", t("ai.trends"));
        const result = await trendsQuery.refetch();
        const trends = (result.data?.trends ?? []).slice(0, 3);
        if (trends.length === 0) {
          addMsg("assistant", t("ai.noTrendData"));
        } else {
          const lines = trends.map((tr: { title: string; avgPrice: number; minPrice: number; maxPrice: number }) =>
            t("ai.trendLine", {
              title: tr.title,
              avgPrice: tr.avgPrice,
              minPrice: tr.minPrice,
              maxPrice: tr.maxPrice,
            })
          );
          addMsg("assistant", `${t("ai.trendsFor", { query: intent.query })}\n\n${lines.join("\n")}`);
        }
      } else {
        addMsg("assistant", t("ai.unknown"));
      }
    } catch {
      addMsg("assistant", t("ai.errorGeneric"));
    } finally {
      setIsLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [input, isLoading, suggestMutation, trendsQuery, t]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50"
        aria-label={t("ai.toggleLabel")}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border-border shadow-2xl z-50 flex flex-col">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">{t("ai.title")}</span>
            <span className="text-xs text-muted-foreground ml-auto">{t("ai.poweredBy")}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t("ai.placeholder")}
              disabled={isLoading}
              className="flex-1"
            />
            <Button size="icon" onClick={sendMessage} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
