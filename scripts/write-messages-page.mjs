import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const d = "div";

const content = `import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUser = parseInt(searchParams.get("user") || "0", 10);
  const [activePartner, setActivePartner] = useState<number>(initialUser);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: threads, refetch: refetchThreads } = trpc.message.threads.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: messages, refetch: refetchMessages } = trpc.message.withUser.useQuery(
    { otherUserId: activePartner },
    { enabled: !!user && activePartner > 0, refetchInterval: 3000 }
  );

  const send = trpc.message.send.useMutation({
    onSuccess: () => {
      setDraft("");
      refetchMessages();
      refetchThreads();
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (initialUser > 0) setActivePartner(initialUser);
  }, [initialUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <${d} className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("messages.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("messages.loginRequired")}</p>
          </CardContent>
        </Card>
      </${d}>
    );
  }

  const activeThread = threads?.find((th) => th.partnerId === activePartner);

  return (
    <${d} className="min-h-screen py-8">
      <${d} className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{t("messages.title")}</h1>
        <${d} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <${d} className="md:col-span-1 space-y-2 max-h-[520px] overflow-y-auto">
            {!threads?.length && (
              <p className="text-sm text-muted-foreground p-3">{t("messages.selectConversation")}</p>
            )}
            {threads?.map((th) => (
              <Card
                key={th.partnerId}
                className={\`cursor-pointer transition-colors \${activePartner === th.partnerId ? "border-primary" : "hover:bg-muted/50"}\`}
                onClick={() => setActivePartner(th.partnerId)}
              >
                <CardContent className="p-3 flex gap-3 items-start">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{th.partnerName.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <${d} className="min-w-0 flex-1">
                    <${d} className="flex justify-between gap-2">
                      <p className="font-medium text-sm truncate">{th.partnerName}</p>
                      {th.unread > 0 && (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full px-2">{th.unread}</span>
                      )}
                    </${d}>
                    <p className="text-xs text-muted-foreground truncate">{th.lastMessage}</p>
                  </${d}>
                </CardContent>
              </Card>
            ))}
          </${d}>
          <${d} className="md:col-span-2">
            <Card className="h-[520px] flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                {activePartner <= 0 ? (
                  <p className="text-sm text-muted-foreground text-center flex-1 flex items-center justify-center">
                    {t("messages.selectConversation")}
                  </p>
                ) : (
                  <>
                    <${d} className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{(activeThread?.partnerName || "?").slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <${d}>
                        <p className="font-medium text-sm">{activeThread?.partnerName}</p>
                        <Link to={\`/profile/\${activePartner}\`} className="text-xs text-primary hover:underline">
                          View profile
                        </Link>
                      </${d}>
                    </${d}>
                    <${d} className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                      {messages?.map((m) => {
                        const mine = m.senderId === user.id;
                        return (
                          <${d}
                            key={m.id}
                            className={\`max-w-[85%] rounded-lg px-3 py-2 text-sm \${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}\`}
                          >
                            <p className="whitespace-pre-wrap">{m.body}</p>
                            <p className={\`text-[10px] mt-1 \${mine ? "opacity-80" : "text-muted-foreground"}\`}>
                              {new Date(m.createdAt).toLocaleString()}
                            </p>
                          </${d}>
                        );
                      })}
                      <${d} ref={bottomRef} />
                    </${d}>
                    <${d} className="flex gap-2">
                      <Input
                        placeholder={t("messages.typePlaceholder")}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                            e.preventDefault();
                            send.mutate({ recipientId: activePartner, body: draft.trim() });
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        disabled={!draft.trim() || send.isPending}
                        onClick={() => send.mutate({ recipientId: activePartner, body: draft.trim() })}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </${d}>
                  </>
                )}
              </CardContent>
            </Card>
          </${d}>
        </${d}>
      </${d}>
    </${d}>
  );
}
`;

writeFileSync(join(__dirname, "../src/pages/Messages.tsx"), content);
