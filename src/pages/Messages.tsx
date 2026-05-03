import { useEffect, useRef, useState } from "react";
import { trpc } from "@/utils/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Send, Pencil, Trash2, Smile, Check, CheckCheck, Loader2, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState(null);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const { data: conversations } = trpc.message.conversations.useQuery();
  const utils = trpc.useContext();

  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.message.messages.useInfiniteQuery(
      { conversationId: activeConversation },
      { enabled: !!activeConversation, getNextPageParam: (last) => last.nextCursor }
    );

  const messages = messagesData?.pages.flatMap((p) => p.items).reverse() ?? [];

  const { mutate: setTyping } = trpc.message.typing.useMutation();
  const { data: typingUsers } = trpc.message.whoIsTyping.useQuery(
    { conversationId: activeConversation },
    { enabled: !!activeConversation, refetchInterval: 2000 }
  );

  const sendMsg = trpc.message.send.useMutation({
    onSuccess: () => {
      utils.message.messages.invalidate({ conversationId: activeConversation });
      utils.message.conversations.invalidate();
      setInput("");
      setTyping({ conversationId: activeConversation, isTyping: false });
    },
  });

  const editMsg = trpc.message.edit.useMutation({
    onSuccess: () => {
      utils.message.messages.invalidate({ conversationId: activeConversation });
      setEditingId(null);
    },
  });

  const deleteMsg = trpc.message.delete.useMutation({
    onSuccess: () => utils.message.messages.invalidate({ conversationId: activeConversation }),
  });

  const reactMsg = trpc.message.react.useMutation({
    onSuccess: () => utils.message.messages.invalidate({ conversationId: activeConversation }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleInputChange = (val) => {
    setInput(val);
    if (activeConversation) {
      setTyping({ conversationId: activeConversation, isTyping: true });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setTyping({ conversationId: activeConversation, isTyping: false });
      }, 2000);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeConversation) return;
    if (editingId) {
      editMsg.mutate({ messageId: editingId, content: input.trim() });
    } else {
      sendMsg.mutate({ conversationId: activeConversation, content: input.trim() });
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("loginRequired")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      <aside className="w-80 border-r flex flex-col">
        <div className="p-4 border-b font-semibold text-lg">{t("messages")}</div>
        <div className="flex-1 overflow-y-auto">
          {conversations?.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConversation(c.id)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-muted transition ${
                activeConversation === c.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">{c.title || t("untitledChat")}</span>
                {c.unread_count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {c.unread_count}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">{c.last_message || t("noMessages")}</p>
            </button>
          ))}
          {(!conversations || conversations.length === 0) && (
            <div className="p-6 text-center text-muted-foreground text-sm">{t("noConversations")}</div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
            <p>{t("selectConversation")}</p>
          </div>
        ) : (
          <>
            <div className="h-14 border-b flex items-center px-4 justify-between">
              <span className="font-medium">
                {conversations?.find((c) => c.id === activeConversation)?.title || t("chat")}
              </span>
              <div className="flex gap-1">
                {(typingUsers?.userIds ?? []).map((uid) => (
                  <span key={uid} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t("typing")}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {hasNextPage && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : t("loadMore")}
                </Button>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                const reactions = JSON.parse(msg.reactions || "[]");
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 relative group ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <div className="text-xs opacity-70 mb-1">{msg.username}</div>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-[10px] opacity-50">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: false })}
                        </span>
                        {isMe && <span className="opacity-60">{msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}</span>}
                      </div>

                      {reactions.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {reactions.map((r, i) => (
                            <span key={i} className="text-xs bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5">{r.emoji}</span>
                          ))}
                        </div>
                      )}

                      <div className={`absolute top-2 ${isMe ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"} hidden group-hover:flex items-center gap-1`}>
                        <button onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)} className="p-1 rounded hover:bg-muted">
                          <Smile className="w-4 h-4" />
                        </button>
                        {isMe && (
                          <>
                            <button onClick={() => { setEditingId(msg.id); setInput(msg.content); }} className="p-1 rounded hover:bg-muted">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteMsg.mutate({ messageId: msg.id })} className="p-1 rounded hover:bg-muted text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {showReactions === msg.id && (
                        <div className={`absolute z-10 bg-popover border rounded-lg p-1 flex gap-1 shadow-lg ${isMe ? "left-0 bottom-full mb-1" : "right-0 bottom-full mb-1"}`}>
                          {EMOJI_LIST.map((e) => (
                            <button key={e} onClick={() => { reactMsg.mutate({ messageId: msg.id, emoji: e }); setShowReactions(null); }} className="hover:bg-muted p-1 rounded">{e}</button>
                          ))}
                        </div>
                      )}

                      {msg.edited && <div className="text-[10px] opacity-40 italic mt-0.5">{t("edited")}</div>}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="h-16 border-t px-4 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={editingId ? t("editMessage") + "..." : t("typeMessage") + "..."}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || sendMsg.isPending}>
                {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}