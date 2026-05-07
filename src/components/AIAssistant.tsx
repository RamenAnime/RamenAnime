import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Hi! I'm your Ramen Anime assistant. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    // Simple rule-based responses (no LLM dependency)
    const lower = userMsg.toLowerCase();
    let reply = "I'm not sure about that. Try asking about marketplace, donations, or support.";
    if (lower.includes("hello") || lower.includes("hi")) reply = "Hello! Welcome to Ramen Anime. How can I assist you today?";
    else if (lower.includes("sell") || lower.includes("listing")) reply = "Go to /marketplace/new to create a listing. You need to be logged in.";
    else if (lower.includes("buy") || lower.includes("purchase")) reply = "Browse the marketplace at /marketplace. Use the search bar to find items.";
    else if (lower.includes("donate")) reply = "Visit /donate to support us via PayPal or Revolut.";
    else if (lower.includes("contact") || lower.includes("support")) reply = "Email us at support@ramenanime.com or use the contact page.";
    else if (lower.includes("login") || lower.includes("account")) reply = "Go to /login to sign in, or click Register if you don't have an account.";
    else if (lower.includes("password") || lower.includes("forgot")) reply = "Use /forgot-password to reset your password.";
    else if (lower.includes("tos") || lower.includes("terms")) reply = "Read our Terms at /terms. You must accept them to use certain features.";
    else if (lower.includes("swarm") || lower.includes("analytics")) reply = "Admins can view site analytics and swarm intelligence at /admin.";

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-card border rounded-lg shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b font-bold text-sm">AI Assistant</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm p-2 rounded ${m.role === "user" ? "bg-primary/10 ml-4" : "bg-muted mr-4"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground italic">Thinking...</div>}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask something..."
              className="flex-1 bg-background border rounded px-2 py-1 text-sm"
            />
            <Button size="sm" onClick={send} disabled={loading}>Send</Button>
          </div>
        </div>
      )}
    </>
  );
}
