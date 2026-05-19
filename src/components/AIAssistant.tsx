import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Intent =
  | { type: "suggest"; query: string; category: string; condition: string }
  | { type: "trends"; query: string }
  | { type: "unknown"; query: string };

const SUGGEST_PATTERNS =
  /suggest|listing|create|write|draft|sell|出品|리스트|刊登|vendre|verkaufen|sugerir/i;
const TREND_PATTERNS =
  /trend|price|market|worth|value|相場|시세|价格|precio|prix|preis|tendência/i;

function normalizeCategory(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, "-");
  const map: Record<string, string> = {
    figures: "figures",
    figure: "figures",
    "trading-cards": "trading-cards",
    cards: "trading-cards",
    "3d-prints": "3d-prints",
    apparel: "apparel",
    accessories: "accessories",
  };
  return map[key] ?? "other";
}

function normalizeCondition(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, "_");
  if (key.includes("like")) return "like_new";
  if (key === "used" || key.includes("occasion")) return "used";
  return "new";
}

function parseIntent(text: string): Intent {
  const lower = text.toLowerCase();
  if (SUGGEST_PATTERNS.test(lower)) {
    const query = text.replace(SUGGEST_PATTERNS, "").trim() || text;
    const categoryMatch = text.match(/\b(figures?|cards?|3d|apparel|accessories)\b/i);
    const conditionMatch = text.match(/\b(new|used|like[- ]?new)\b/i);
    return {
      type: "suggest",
      query,
      category: normalizeCategory(categoryMatch?.[1] ?? "figures"),
      condition: normalizeCondition(conditionMatch?.[1] ?? "new"),
    };
  }
  if (TREND_PATTERNS.test(lower)) {
    const query = text.replace(TREND_PATTERNS, "").trim() || text;
    return { type: "trends", query };
  }
  return { type: "unknown", query: text };
}

export default function AIAssistant() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    setMessages((m) =>
      m.length === 0 ? [{ role: "assistant", content: t("ai.greeting") }] : m,
    );
  }, [t, i18n.language]);

  const suggestMutation = trpc.ai.listingSuggest.useMutation();

  const addMsg = (role: "user" | "assistant", content: string) =>
    setMessages((prev) => [...prev, { role, content }]);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
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
          addMsg(
            "assistant",
            t("ai.listingResult", {
              title: result.title,
              description: result.description,
              price: result.suggestedPrice?.toFixed(2) ?? "0.00",
              category: result.category,
              condition: result.condition,
            }),
          );
        } else if (intent.type === "trends") {
          addMsg("assistant", t("ai.trends"));
          const result = await utils.client.ai.trends.query({ query: intent.query });
          const trends = (result?.trends ?? []).slice(0, 3);
          if (trends.length === 0) {
            addMsg("assistant", t("ai.noTrendData"));
          } else {
            const lines = trends.map(
              (tr: { title: string; avgPrice: number; minPrice: number; maxPrice: number }) =>
                t("ai.trendLine", {
                  title: tr.title,
                  avgPrice: tr.avgPrice,
                  minPrice: tr.minPrice,
                  maxPrice: tr.maxPrice,
                }),
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
    },
    [input, isLoading, suggestMutation, utils.client.ai.trends, t],
  );

  const suggestions = [t("ai.suggestion1"), t("ai.suggestion2"), t("ai.suggestion3")];

  return (
    <>
      <Button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50"
        aria-label={t("ai.toggleLabel")}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-card border-border shadow-2xl z-50 flex flex-col">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">{t("ai.title")}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
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

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1"
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t("ai.placeholder")}
              disabled={isLoading}
              className="flex-1"
            />
            <Button size="icon" onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
