import { useState, useEffect, useRef, useCallback } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, X, Send, Loader2, Cpu } from "lucide-react";

const MODEL_NAME = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
const SYSTEM_PROMPT = `You are the Ramen Anime marketplace assistant. You help users find anime collectibles, figures, trading cards, and merchandise. You know about:
- Anime series and characters
- Collectible grading and pricing
- Auction mechanics and bidding
- Shipping and payment questions
- Marketplace policies

Be friendly, concise, and helpful. If you don't know something, say so.`;

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: "assistant", content: "Hi! I'm your Ramen Anime assistant. Ask me anything about collectibles, auctions, or finding that perfect figure!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [progress, setProgress] = useState("");
  const [usingGPU, setUsingGPU] = useState(false);
  const chatRef = useRef<webllm.ChatModule | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebLLM on mount
  useEffect(() => {
    let chat: webllm.ChatModule | null = null;
    
    async function init() {
      try {
        // Check WebGPU support
        if (!navigator.gpu) {
          setProgress("WebGPU not available. Using CPU fallback (slower).");
          setUsingGPU(false);
        } else {
          setUsingGPU(true);
        }
        
        chat = new webllm.ChatModule();
        chat.setInitProgressCallback((report: any) => {
          setProgress(`Loading AI model... ${Math.round(report.progress * 100)}%`);
        });
        
        await chat.reload(MODEL_NAME, {
          chatOpts: { temperature: 0.7, max_gen_len: 512 },
        });
        
        chatRef.current = chat;
        setModelLoaded(true);
        setProgress("");
      } catch (err) {
        setProgress("AI model failed to load. Please refresh.");
        console.error("WebLLM init error:", err);
      }
    }
    
    init();
    
    return () => {
      if (chat) chat.unload();
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !chatRef.current || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    
    try {
      const reply = await chatRef.current.generate(userMsg, (step: any) => {
        // Streaming not supported in simple mode, wait for full response
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble processing that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </Button>
      
      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border-border shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Ramen AI</span>
            {usingGPU && <Cpu className="w-4 h-4 text-green-500 ml-auto" title="Running on your GPU" />}
            {progress && <span className="text-xs text-muted-foreground ml-auto">{progress}</span>}
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
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
          
          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={modelLoaded ? "Ask about collectibles..." : "Loading AI model..."}
              disabled={!modelLoaded || isLoading}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={sendMessage}
              disabled={!modelLoaded || isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
