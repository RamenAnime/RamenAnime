import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mail, Trash2, Eye, Plus, MessageSquare, Inbox, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function MessageList({ messages, loading, onView, type, onDelete }: {
  messages: any[]; loading: boolean; onView: (id: number) => void; type: string; onDelete: (id: number) => void;
n}) {
  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card/50 animate-pulse h-20" />)}</div>;
  if (!messages.length) return (
    <Card className="bg-card border-border p-8 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No messages</p>
    </Card>
  );
  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-2">
        {messages.map((m) => (
          <Card key={m.id} className={`bg-card border-border hover:border-primary/30 transition-colors cursor-pointer ${!m.isRead && type === "inbox" ? "border-primary/30 bg-primary/5" : ""}`} onClick={() => onView(m.id)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{m.subject}</p>
                  {!m.isRead && type === "inbox" && <Badge variant="default" className="text-[10px] h-4">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {type === "inbox" ? `From: ${m.senderName}` : `To: ${m.recipientName}`} | {new Date(m.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{m.body}</p>
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => onView(m.id)}><Eye className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(m.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

function ComposeForm({ onSent }: { onSent: () => void }) {
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const utils = trpc.useUtils();
  const send = trpc.message.send.useMutation({
    onSuccess: () => { onSent(); utils.message.inbox.invalidate(); utils.message.sent.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium mb-1 block">Recipient User ID</label>
        <Input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="Enter recipient's user ID number" className="bg-muted/50" />
        <p className="text-xs text-muted-foreground mt-1">Find this on their profile page URL</p>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="bg-muted/50" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Message</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={5} className="bg-muted/50" />
      </div>
      <Button
        className="w-full bg-primary text-primary-foreground"
        disabled={!recipientId.trim() || !subject.trim() || !body.trim() || send.isPending}
        onClick={() => send.mutate({ recipientId: parseInt(recipientId), subject, body })}
      >
        {send.isPending ? "Sending..." : "Send Message"}
      </Button>
    </div>
  );
}

export default function Messages() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [viewingMessage, setViewingMessage] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: inbox, isLoading: inboxLoading } = trpc.message.inbox.useQuery();
  const { data: sent, isLoading: sentLoading } = trpc.message.sent.useQuery();
  const { data: messageDetail } = trpc.message.get.useQuery(
    { id: viewingMessage ?? 0 }, { enabled: viewingMessage !== null }
  );

  const deleteMsg = trpc.message.delete.useMutation({
    onSuccess: () => {
      toast.success("Message deleted");
      utils.message.inbox.invalidate();
      utils.message.sent.invalidate();
      setViewingMessage(null);
    },
  });

  if (viewingMessage && messageDetail) {
    return (
      <div className="min-h-screen py-8">
        <div className="container px-4 max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => setViewingMessage(null)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{messageDetail.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    From: <strong>{messageDetail.senderName}</strong> | To: <strong>{messageDetail.recipientName}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(messageDetail.createdAt).toLocaleString()}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMsg.mutate({ id: messageDetail.id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="border-t border-border pt-4 whitespace-pre-wrap text-sm">{messageDetail.body}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New Message</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader><DialogTitle>Send Message</DialogTitle></DialogHeader>
              <ComposeForm onSent={() => { setComposeOpen(false); utils.message.inbox.invalidate(); utils.message.sent.invalidate(); }} />
            </DialogContent>
          </Dialog>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-muted">
            <TabsTrigger value="inbox"><Inbox className="h-4 w-4 mr-1" /> Inbox</TabsTrigger>
            <TabsTrigger value="sent"><Send className="h-4 w-4 mr-1" /> Sent</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox">
            <MessageList messages={inbox ?? []} loading={inboxLoading} onView={setViewingMessage} type="inbox" onDelete={(id) => deleteMsg.mutate({ id })} />
          </TabsContent>
          <TabsContent value="sent">
            <MessageList messages={sent ?? []} loading={sentLoading} onView={setViewingMessage} type="sent" onDelete={(id) => deleteMsg.mutate({ id })} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
