"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  Send,
  CheckCheck,
  Check,
  MessageCircle,
  Lock,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { useMessages } from "@/lib/messages-context";

// Type definitions
interface Message {
  id: string;
  sender: "client" | "lawyer";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Chat {
  id: string;
  consultationId: string;
  lawyerName: string;
  lawyerSpecialization: string;
  avatar: string;
  online: boolean;
  verified: boolean;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
  caseDescription?: string;
  isPending?: boolean;
  lawyerDetails?: {
    fullName?: string;
    phone?: string;
    email?: string;
    rating?: number;
  };
}

const initialChats: Chat[] = [];

function MessagesContent() {
  const router = useRouter();
  const { chats, addChat, markAsRead, updateChat } = useMessages();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // handle pending lawyer redirect - client side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const pendingLawyerId = params.get("lawyerId");
    const caseDesc = params.get("caseDescription");
    const lawyerSpec = params.get("specialization");
    const hashedName = params.get("lawyerName");
    if (pendingLawyerId && caseDesc && lawyerSpec) {
      const chatId = pendingLawyerId; // Keep as string
      const existingChat = chats.find((c) => c.id === chatId);
      if (existingChat) {
        setSelectedChat(chatId);
        window.history.replaceState({}, "", "/messages");
        return;
      }
      const pendingChat: Chat = {
        id: chatId,
        consultationId: chatId, // Add required field
        lawyerName: hashedName || "Lawyer (Pending Acceptance)",
        lawyerSpecialization: lawyerSpec,
        avatar: "⚖️",
        online: false,
        verified: false,
        lastMessage: `Consultation request sent`,
        timestamp: "Just now",
        unread: 0,
        isPending: true,
        messages: [
          {
            id: Date.now().toString(),
            sender: "client",
            text: caseDesc,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "sent",
          },
          {
            id: (Date.now() + 1).toString(),
            sender: "client",
            text: "✅ Your consultation request has been sent. Waiting for the lawyer to accept...",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "delivered",
          },
        ],
        caseDescription: caseDesc,
      };
      addChat(pendingChat);
      setSelectedChat(pendingChat.id);
      window.history.replaceState({}, "", "/messages");
    }
  }, [chats, addChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, chats]);

  useEffect(() => {
    if (selectedChat) markAsRead(selectedChat);
  }, [selectedChat, markAsRead]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.lawyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lawyerSpecialization
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const currentChat = chats.find((c) => c.id === selectedChat);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;
    const chat = chats.find((c) => c.id === selectedChat);
    if (chat?.isPending) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "client",
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };
    updateChat(selectedChat, {
      messages: [...chat!.messages, newMessage],
      lastMessage: messageInput,
      timestamp: "Just now",
    });
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    if (!status) return null;
    return status === "sent" ? (
      <Check className="h-3 w-3" />
    ) : (
      <CheckCheck className="h-3 w-3" />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />

      {/* Mobile top bar for sidebar toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </Button>
        <h2 className="text-foreground font-bold">Messages</h2>
        <div className="w-5" />
      </div>

      <main className="flex-grow overflow-hidden">
        <div className="h-full flex relative">
          {/* Sidebar */}
          <div
            className={cn(
              "absolute md:static top-0 left-0 h-full w-80 md:w-96 border-r border-border flex flex-col bg-muted/30 backdrop-blur-sm transform transition-transform duration-300 z-30",
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            )}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border hidden md:block">
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-bold text-foreground text-xl font-body">
                  Messages
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-muted rounded-lg"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
                  <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-foreground font-semibold mb-2">
                    No Conversations
                  </h3>
                  <Button
                    onClick={() => router.push("/consult")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Find a Lawyer
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full p-4 flex items-start gap-3 text-left transition-all",
                        selectedChat === chat.id
                          ? "bg-primary/10 border-l-2 border-primary"
                          : "hover:bg-muted border-l-2 border-transparent",
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                          <span>{chat.avatar}</span>
                        </div>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-card" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-foreground text-sm font-semibold truncate">
                            {chat.lawyerName}
                          </h4>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {chat.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-muted/50 backdrop-blur-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* back button on mobile */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <MessageCircle className="h-5 w-5 text-foreground" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                      <span>{currentChat.avatar}</span>
                    </div>
                    <div>
                      <h2 className="text-foreground font-bold text-sm sm:text-base">
                        {currentChat.lawyerName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {currentChat.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                  {currentChat.messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex",
                        m.sender === "client"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3",
                          m.sender === "client"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border border-border",
                        )}
                      >
                        <p className="text-sm sm:text-base break-words">
                          {m.text}
                        </p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className="text-[10px] text-muted-foreground">
                            {m.timestamp}
                          </span>
                          {m.sender === "client" && (
                            <span className="text-primary-foreground/60">
                              {getMessageStatusIcon(m.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-border bg-muted/50 backdrop-blur-sm flex items-end gap-2 sm:gap-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground text-sm sm:text-base focus:outline-none resize-none max-h-32"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4 text-primary-foreground" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground text-sm sm:text-base">
                Select a conversation
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
        `}</style>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-primary">
          Loading messages...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
