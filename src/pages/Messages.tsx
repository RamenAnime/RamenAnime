import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full"><CardContent className="p-6 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Messages</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your messages</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors"><CardContent className="p-3">
              <p className="font-medium text-sm">System</p>
              <p className="text-xs text-muted-foreground">Welcome to Ramen Anime!</p>
            </CardContent></Card>
          </div>
          <div className="md:col-span-2">
            <Card className="h-[500px] flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex-1 bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto">
                  <p className="text-sm text-muted-foreground text-center">Select a conversation to start messaging</p>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
                  <Button size="icon"><Send className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
