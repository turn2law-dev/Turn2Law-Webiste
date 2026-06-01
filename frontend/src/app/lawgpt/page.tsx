"use client";

import React, { useRef, useEffect, useState } from "react";
import Header from "@/components/layout/header";
import WowAhhAnimation from "./Animation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useNotification } from "@/contexts/notification-context";

// Simple skeleton loader component
function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div
        className="h-3 rounded bg-neutral-300 dark:bg-neutral-400/60 animate-pulse"
        style={{ width: "80%" }}
      />
      <div
        className="h-3 rounded bg-neutral-300/80 dark:bg-neutral-400/40 animate-pulse"
        style={{ width: "60%" }}
      />
      <div
        className="h-3 rounded bg-neutral-300/90 dark:bg-neutral-400/50 animate-pulse"
        style={{ width: "70%" }}
      />
      <div
        className="h-3 rounded bg-neutral-300/70 dark:bg-neutral-400/30 animate-pulse"
        style={{ width: "40%" }}
      />
      <div
        className="h-3 rounded bg-neutral-300/60 dark:bg-neutral-400/20 animate-pulse"
        style={{ width: "30%" }}
      />
    </div>
  );
}

// Custom LawGPT Sidebar
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface LawGPTSidebarProps {
  onClose: () => void;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

function LawGPTSidebar({
  onClose,
  chatSessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
}: LawGPTSidebarProps) {
  return (
    <div
      className="fixed top-0 left-0 h-screen w-[85vw] sm:w-[340px] max-w-[340px] z-[100] bg-white dark:bg-card border-r border-gray-200 dark:border-border flex flex-col shadow-2xl"
      style={{ minWidth: "min(85vw, 340px)" }}
    >
      {/* Header with LawGPT icon and close button */}
      <div
        className="flex items-center justify-between px-4 sm:px-7 pt-3 pb-2 border-b border-gray-200 dark:border-border/50"
        style={{ minHeight: 56 }}
      >
        <div className="flex items-center gap-3">
          <svg
            width="31"
            height="31"
            viewBox="0 0 31 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.35028 11.6585C5.38323 9.62556 8.67069 9.61698 10.693 11.6393L14.0619 15.0082L10.7122 18.3579C8.67927 20.3908 5.39181 20.3994 3.36946 18.377L0.000606868 15.0082L3.35028 11.6585Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
            <path
              d="M18.3581 3.34931C20.391 5.38225 20.3996 8.66971 18.3773 10.6921L15.0084 14.0609L11.6587 10.7112C9.6258 8.6783 9.61722 5.39083 11.6396 3.36848L15.0084 -0.000370287L18.3581 3.34931Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
            <path
              d="M19.3044 11.6585C21.3373 9.62556 24.6248 9.61698 26.6471 11.6393L30.016 15.0082L26.6663 18.3579C24.6334 20.3908 21.3459 20.3994 19.3236 18.377L15.9547 15.0082L19.3044 11.6585Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
            <path
              d="M18.4934 19.1696C20.5263 21.2026 20.5033 24.5216 18.4421 26.5828L15.0085 30.0164L11.6588 26.6668C9.62585 24.6338 9.64879 21.3148 11.71 19.2536L15.1437 15.8199L18.4934 19.1696Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
          </svg>
          <span
            className="font-bold text-2xl text-gray-800 dark:text-white/80"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            LawGPT
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex items-center justify-center h-[45px] w-[45px] hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors focus:outline-none"
          style={{
            boxShadow: "none",
            background: "none",
            padding: 0,
          }}
          aria-label="Close sidebar"
        >
          {/* Double chevron (>>) icon for closing, as provided */}
          <svg
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.0484 8.0849C17.3881 8.42467 17.3881 8.97551 17.0484 9.31527L11.8635 14.5001L17.0484 19.6849C17.3881 20.0246 17.3881 20.5754 17.0484 20.9153C16.7086 21.255 16.1577 21.255 15.818 20.9153L10.018 15.1153C9.85484 14.9521 9.76318 14.7308 9.76318 14.5001C9.76318 14.2693 9.85484 14.0481 10.018 13.8849L15.818 8.0849C16.1577 7.74514 16.7086 7.74514 17.0484 8.0849Z"
              className="fill-gray-700 dark:fill-white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.2852 8.0849C10.6249 8.42467 10.6249 8.97551 10.2852 9.31527L5.10035 14.5001L10.2852 19.6849C10.6249 20.0246 10.6249 20.5754 10.2852 20.9153C9.94542 21.255 9.39456 21.255 9.05481 20.9153L3.25481 15.1153C3.09166 14.9521 3 14.7308 3 14.5001C3 14.2693 3.09166 14.0481 3.25481 13.8849L9.05481 8.0849C9.39456 7.74514 9.94542 7.74514 10.2852 8.0849Z"
              className="fill-gray-700 dark:fill-white"
            />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 sm:px-7 pt-4 pb-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C9B97]/20 to-[#3C9B97]/10 hover:from-[#3C9B97]/30 hover:to-[#3C9B97]/20 text-gray-800 dark:text-foreground font-bold transition-all border border-[#3C9B97]/20 active:scale-95"
          style={{
            height: 42,
            borderRadius: 13,
            fontFamily: "Instrument Sans, sans-serif",
            fontSize: "1rem",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-7 pt-4">
        <div className="flex flex-col gap-4">
          {chatSessions.length === 0 ? (
            <p
              className="text-gray-500 dark:text-white/40 text-sm text-center py-8"
              style={{ fontFamily: "Instrument Sans, sans-serif" }}
            >
              No chat history yet
            </p>
          ) : (
            chatSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={
                  `font-bold text-base sm:text-[1.18rem] flex items-center transition-all cursor-pointer select-none rounded-[13px] active:scale-95 ` +
                  (session.id === currentSessionId
                    ? "bg-gradient-to-r from-[#3C9B97]/20 to-[#3C9B97]/10 text-gray-800 dark:text-white border border-[#3C9B97]/30"
                    : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400")
                }
                style={{
                  width: "100%",
                  maxWidth: 239,
                  height: 42,
                  paddingLeft: 16,
                  paddingRight: 16,
                  fontFamily: "Instrument Sans, sans-serif",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  marginLeft: 0,
                  marginRight: 0,
                  boxSizing: "border-box",
                }}
              >
                {session.title}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="py-6" />
    </div>
  );
}

// Auto-sizing chat bubble component
function AutoBubble({
  message,
  messageId,
}: {
  message: string;
  messageId: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [bubbleSize, setBubbleSize] = useState({ width: 120, height: 60 });
  const [pop, setPop] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    const calculateSize = () => {
      const padding = 36;
      const verticalPadding = 36;
      const minWidth = 120;
      const minHeight = 60;
      const maxSingleLineWidth = 400;
      const wrapWidth = 380;

      const measureContainer = document.createElement("div");
      measureContainer.style.position = "absolute";
      measureContainer.style.visibility = "hidden";
      measureContainer.style.top = "-9999px";
      measureContainer.style.left = "-9999px";
      measureContainer.style.pointerEvents = "none";
      measureContainer.id = `bubble-measure-${messageId}`;
      document.body.appendChild(measureContainer);

      try {
        const singleLineDiv = document.createElement("div");
        singleLineDiv.style.fontSize = "20px";
        singleLineDiv.style.fontFamily = "Instrument Sans, sans-serif";
        singleLineDiv.style.fontWeight = "600";
        singleLineDiv.style.lineHeight = "24px";
        singleLineDiv.style.whiteSpace = "nowrap";
        singleLineDiv.style.display = "inline-block";
        singleLineDiv.textContent = message;
        measureContainer.appendChild(singleLineDiv);

        const naturalWidth = singleLineDiv.offsetWidth;
        const singleLineWidth = naturalWidth + padding;

        let finalWidth, finalHeight;

        if (singleLineWidth > maxSingleLineWidth) {
          const wrappedDiv = document.createElement("div");
          wrappedDiv.style.fontSize = "20px";
          wrappedDiv.style.fontFamily = "Instrument Sans, sans-serif";
          wrappedDiv.style.fontWeight = "600";
          wrappedDiv.style.lineHeight = "24px";
          wrappedDiv.style.whiteSpace = "pre-wrap";
          wrappedDiv.style.wordBreak = "break-word";
          wrappedDiv.style.overflowWrap = "break-word";
          wrappedDiv.style.width = `${wrapWidth}px`;
          wrappedDiv.textContent = message;
          measureContainer.appendChild(wrappedDiv);

          const wrappedHeight = wrappedDiv.offsetHeight;
          finalWidth = wrapWidth + padding;
          finalHeight = Math.max(minHeight, wrappedHeight + verticalPadding);
        } else {
          finalWidth = Math.max(singleLineWidth, minWidth);
          finalHeight = minHeight;
        }

        setBubbleSize({ width: finalWidth, height: finalHeight });
        setIsCalculated(true);
        setPop(true);
        setTimeout(() => setPop(false), 200);
      } finally {
        document.body.removeChild(measureContainer);
      }
    };

    if (message && messageId) {
      setIsCalculated(false);
      setBubbleSize({ width: 120, height: 60 });

      requestAnimationFrame(() => {
        calculateSize();
      });
    }
  }, [message, messageId]);

  return (
    <div className="inline-block">
      <svg
        key={`${messageId}-${isCalculated}`}
        width={bubbleSize.width}
        height={bubbleSize.height}
        viewBox={`0 0 ${bubbleSize.width} ${bubbleSize.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-auto transition-all duration-300 ${pop ? "scale-105" : "scale-100"}`}
        style={{
          filter: "drop-shadow(0 4px 16px rgba(60,155,151,0.18))",
          borderRadius: 32,
          transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
          display: "block",
        }}
      >
        <path
          d={`M0 28C0 12.536 12.536 0 28 0H${bubbleSize.width - 28}C${bubbleSize.width - 12.536} 0 ${bubbleSize.width} 12.536 ${bubbleSize.width} 28V${bubbleSize.height - 28}C${bubbleSize.width} ${bubbleSize.height - 12.536} ${bubbleSize.width - 12.536} ${bubbleSize.height} ${bubbleSize.width - 28} ${bubbleSize.height}H28C12.536 ${bubbleSize.height} 0 ${bubbleSize.height - 12.536} 0 ${bubbleSize.height - 28}V28Z`}
          fill="#3C9B97"
          fillOpacity="0.8"
        />
        <foreignObject
          x="18"
          y="18"
          width={bubbleSize.width - 36}
          height={bubbleSize.height - 36}
        >
          <div
            ref={textRef}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: bubbleSize.height <= 60 ? "center" : "flex-start",
              justifyContent: "flex-start",
              color: "white",
              fontWeight: 600,
              fontSize: 20,
              lineHeight: "24px",
              fontFamily: "Instrument Sans, sans-serif",
              textAlign: "left",
              wordBreak: "break-word",
              padding: "0",
              margin: "0",
              boxSizing: "border-box",
              overflow: "visible",
              whiteSpace: bubbleSize.width > 400 ? "pre-wrap" : "nowrap",
              overflowWrap: "break-word",
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                width: "100%",
                display: "block",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: bubbleSize.width > 400 ? "pre-wrap" : "nowrap",
              }}
            >
              {message}
            </span>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

interface LawGPTHeaderProps {
  onSidebarOpen: () => void;
  sidebarOpen: boolean;
}

function LawGPTHeader({ onSidebarOpen, sidebarOpen }: LawGPTHeaderProps) {
  return (
    <Header
      leftElement={
        <div className="flex items-center relative">
          <button
            className="mr-2 flex items-center focus:outline-none"
            onClick={onSidebarOpen}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <svg
                width="29"
                height="29"
                viewBox="0 0 29 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "scaleX(-1)" }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.9516 20.9151C11.6119 20.5753 11.6119 20.0245 11.9516 19.6847L17.1365 14.4999L11.9516 9.31508C11.6119 8.97539 11.6119 8.42458 11.9516 8.0847C12.2914 7.74502 12.8423 7.74502 13.182 8.0847L18.982 13.8847C19.1452 14.0479 19.2368 14.2692 19.2368 14.4999C19.2368 14.7307 19.1452 14.9519 18.982 15.1151L13.182 20.9151C12.8423 21.2549 12.2914 21.2549 11.9516 20.9151Z"
                  className="fill-gray-800 dark:fill-white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.2549 20.9151C18.9151 20.5753 18.9151 20.0245 19.2549 19.6847L24.4397 14.4999L19.2549 9.31508C18.9151 8.97539 18.9151 8.42458 19.2549 8.0847C19.5946 7.74502 20.1455 7.74502 20.4852 8.0847L26.2852 13.8847C26.4484 14.0479 26.54 14.2692 26.54 14.4999C26.54 14.7307 26.4484 14.9519 26.2852 15.1151L20.4852 20.9151C20.1455 21.2549 19.5946 21.2549 19.2549 20.9151Z"
                  className="fill-gray-800 dark:fill-white"
                />
              </svg>
            ) : (
              <svg
                width="29"
                height="29"
                viewBox="0 0 29 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.9516 20.9151C11.6119 20.5753 11.6119 20.0245 11.9516 19.6847L17.1365 14.4999L11.9516 9.31508C11.6119 8.97539 11.6119 8.42458 11.9516 8.0847C12.2914 7.74502 12.8423 7.74502 13.182 8.0847L18.982 13.8847C19.1452 14.0479 19.2368 14.2692 19.2368 14.4999C19.2368 14.7307 19.1452 14.9519 18.982 15.1151L13.182 20.9151C12.8423 21.2549 12.2914 21.2549 11.9516 20.9151Z"
                  className="fill-gray-800 dark:fill-white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.2549 20.9151C18.9151 20.5753 18.9151 20.0245 19.2549 19.6847L24.4397 14.4999L19.2549 9.31508C18.9151 8.97539 18.9151 8.42458 19.2549 8.0847C19.5946 7.74502 20.1455 7.74502 20.4852 8.0847L26.2852 13.8847C26.4484 14.0479 26.54 14.2692 26.54 14.4999C26.54 14.7307 26.4484 14.9519 26.2852 15.1151L20.4852 20.9151C20.1455 21.2549 19.5946 21.2549 19.2549 20.9151Z"
                  className="fill-gray-800 dark:fill-white"
                />
              </svg>
            )}
          </button>

          <svg
            width="2"
            height="45"
            viewBox="0 0 2 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "fixed",
              right: -17,
              top: -7,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Separator"
            className="dark:opacity-100 opacity-40"
          >
            <path
              d="M1 1V44"
              className="stroke-gray-400 dark:stroke-white"
              strokeOpacity="0.4"
            />
          </svg>

          <svg
            width="31"
            height="31"
            viewBox="0 0 31 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "fixed",
              right: -65,
              top: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: "0px",
            }}
            aria-label="LawGPT logo"
          >
            <path
              d="M3.3498 11.6585C5.38274 9.62556 8.6702 9.61698 10.6926 11.6393L14.0614 15.0082L10.7117 18.3579C8.67879 20.3908 5.39132 20.3994 3.36897 18.377L0.000118587 15.0082L3.3498 11.6585Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
            <path
              d="M18.3581 3.35028C20.391 5.38323 20.3996 8.67069 18.3773 10.693L15.0084 14.0619L11.6587 10.7122C9.6258 8.67927 9.61722 5.39181 11.6396 3.36946L15.0084 0.000606276L18.3581 3.35028Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
            <path
              d="M19.3044 11.6585C21.3373 9.62556 24.6248 9.61698 26.6471 11.6393L30.016 15.0082L26.6663 18.3579C24.6334 20.3908 21.3459 20.3994 19.3236 18.377L15.9547 15.0082L19.3044 11.6585Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
            <path
              d="M18.4929 19.1696C20.5258 21.2026 20.5029 24.5216 18.4416 26.5828L15.008 30.0164L11.6583 26.6668C9.62536 24.6338 9.64831 21.3148 11.7096 19.2536L15.1432 15.8199L18.4929 19.1696Z"
              fill="#3C9B97"
              fillOpacity="0.6"
            />
          </svg>
        </div>
      }
    />
  );
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  title?: string;
  timestamp: Date;
}

export default function LawGPTPage() {
  const { showNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true); // New state to track auth check
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount using Supabase Auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[LawGPT] Checking Supabase Auth session...');
        setIsAuthChecking(true);
        const { getSession, getUserProfile } = await import('@/lib/supabase-auth');

        const session = await getSession();

        if (session && session.user) {
          console.log('[LawGPT] User authenticated:', session.user.id);
          setIsAuthenticated(true);
          setUserId(session.user.id);

          // Load daily message count from localStorage
          const today = new Date().toDateString();
          const storedData = localStorage.getItem(`lawgpt_daily_${session.user.id}`);
          if (storedData) {
            const { date, count } = JSON.parse(storedData);
            if (date === today) {
              setDailyMessageCount(count);
            } else {
              // Reset count for new day
              localStorage.setItem(`lawgpt_daily_${session.user.id}`, JSON.stringify({ date: today, count: 0 }));
              setDailyMessageCount(0);
            }
          }
        } else {
          console.log('[LawGPT] No active session');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[LawGPT] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Load user and chat sessions from Supabase on mount
  useEffect(() => {
    const loadUserAndSessions = async () => {
      if (!userId) return;

      try {
        const { getLawGPTSessions } = await import('@/lib/supabase');

        // Load existing chat sessions
        const sessions = await getLawGPTSessions(userId);
        const formattedSessions: ChatSession[] = sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          messages: session.messages || [],
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at)
        }));

        setChatSessions(formattedSessions);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    };

    loadUserAndSessions();
  }, [userId]);

  // Save chat session to Supabase whenever chatHistory changes
  useEffect(() => {
    const saveSession = async () => {
      if (!userId || chatHistory.length === 0) {
        console.log('[LawGPT] Skipping save - userId:', userId, 'chatHistory length:', chatHistory.length);
        return;
      }

      console.log('[LawGPT] Attempting to save session - userId:', userId, 'currentSessionId:', currentSessionId, 'messages:', chatHistory.length);

      try {
        const { createLawGPTSession, updateLawGPTSession } = await import('@/lib/supabase');

        // Generate title from first user message
        const title = chatHistory.find(msg => msg.type === 'user')?.content.substring(0, 50) + '...' || 'New Chat';

        if (!currentSessionId) {
          // Create new session
          console.log('[LawGPT] Creating new session with title:', title);
          const { data, error } = await createLawGPTSession(userId, title);

          if (error) {
            console.error('[LawGPT] Error creating session:', error);
            return;
          }

          if (data) {
            console.log('[LawGPT] Session created successfully:', data);
            setCurrentSessionId(data.id);

            // Update session with messages
            console.log('[LawGPT] Updating session with messages:', chatHistory.length);
            const updateResult = await updateLawGPTSession(data.id, chatHistory);
            if (updateResult.error) {
              console.error('[LawGPT] Error updating session messages:', updateResult.error);
            } else {
              console.log('[LawGPT] Session messages updated successfully');
            }

            // Add to sessions list
            setChatSessions(prev => [{
              id: data.id,
              title,
              messages: chatHistory,
              createdAt: new Date(),
              updatedAt: new Date()
            }, ...prev]);
            console.log('[LawGPT] Session added to sessions list');
          }
        } else {
          // Update existing session
          console.log('[LawGPT] Updating existing session:', currentSessionId);
          const { data, error } = await updateLawGPTSession(currentSessionId, chatHistory);

          if (error) {
            console.error('[LawGPT] Error updating session:', error);
          } else {
            console.log('[LawGPT] Session updated successfully');
          }

          // Update in sessions list
          setChatSessions(prev => prev.map(session =>
            session.id === currentSessionId
              ? { ...session, messages: chatHistory, updatedAt: new Date() }
              : session
          ));
        }
      } catch (error) {
        console.error('[LawGPT] Exception saving chat session:', error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveSession, 1000);
    return () => clearTimeout(timeoutId);
  }, [chatHistory, userId, currentSessionId]);

  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentSessionId(null);
    setMessage("");
    setSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setChatHistory(session.messages);
      setCurrentSessionId(sessionId);
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Removed auto-scroll to bottom effect to allow users to read at their own pace
  // Users can manually scroll down to see new messages

  useEffect(() => {
    if (chatHistory.length > 0) return;

    const preventScroll = (e: Event) => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    window.addEventListener("scroll", preventScroll, { passive: false });

    const timeoutId = setTimeout(() => {
      window.removeEventListener("scroll", preventScroll);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", preventScroll);
    };
  }, [chatHistory]);

  useEffect(() => {
    const ensureTopPosition = () => {
      if (window.scrollY === 0) return;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    const interval = setInterval(ensureTopPosition, 100);
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  // Function to clean markdown content - remove emojis but keep formatting
  const cleanMarkdownContent = (content: string): string => {
    // Remove all emojis and special symbols, but keep regular punctuation and markdown syntax
    return content.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const getAiResponse = async (userMessage: string): Promise<string> => {
    try {
      // Create an AbortController for timeout
      // Render.com free tier can take up to 2 minutes to cold start
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

      const lawgptApiUrl = process.env.NEXT_PUBLIC_LAWGPT_API_URL || 'https://turn2law-lawgpt-zzj3.onrender.com';
      const response = await fetch(`${lawgptApiUrl}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseText = await response.text();

      // Parse JSON response and extract the "response" field
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.response) {
          // Clean the response to remove emojis
          const cleanedResponse = cleanMarkdownContent(jsonResponse.response);
          return cleanedResponse;
        }
        return cleanMarkdownContent(responseText);
      } catch (parseError) {
        return cleanMarkdownContent(responseText);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return "⏰ The server is taking longer than expected to respond. This usually happens when the server needs to wake up (cold start on free tier hosting). Please try your question again - it should be much faster now!";
      }
      return "I'm experiencing technical difficulties right now. For immediate legal assistance, please book a consultation with one of our qualified lawyers through our platform. They can provide personalized advice for your specific situation.";
    }
  };



  const handleSend = async () => {
    if (message.trim() !== "") {
      // Wait for auth check to complete, then check authentication
      if (isAuthChecking) {
        // Still checking auth, wait a moment
        return;
      }

      if (!isAuthenticated || !userId) {
        showNotification(
          "Please login or sign up to use LawGPT. You will be redirected to the login page.",
          'info'
        );
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      /*
      // Daily limit bypassed as per request
      // Check daily message limit (5 messages per day)
      if (dailyMessageCount >= 5) {
        setShowLimitModal(true);
        return;
      }
      */

      const currentMessage = message.trim();

      // Clear the message input immediately
      setMessage("");
      const currentTextarea =
        chatHistory.length === 0
          ? textareaRef.current
          : bottomTextareaRef.current;
      if (currentTextarea) {
        currentTextarea.style.height = "24px";
      }

      /*
      // Increment daily message count
      const newCount = dailyMessageCount + 1;
      setDailyMessageCount(newCount);
      const today = new Date().toDateString();
      localStorage.setItem(`lawgpt_daily_${userId}`, JSON.stringify({ date: today, count: newCount }));
      */

      // Don't set currentSessionId here - let the save effect create it in Supabase
      // The UUID will be generated by Supabase and returned in the create response

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: currentMessage,
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, userMessage]);
      setAiLoading(true);

      try {
        const aiResponseContent = await getAiResponse(currentMessage);

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: aiResponseContent,
          timestamp: new Date(),
        };

        setChatHistory((prev) => [...prev, aiMessage]);

        // Set loading to false after message is added
        setAiLoading(false);
      } catch (error) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content:
            "I'm experiencing technical difficulties. For immediate legal assistance, please book a consultation with one of our qualified lawyers. You can find experienced lawyers in your area through our consultation booking system.",
          timestamp: new Date(),
        };

        setChatHistory((prev) => [...prev, aiMessage]);
        setAiLoading(false);
      }

      // Removed auto-scroll to bottom - users can scroll manually to read at their own pace
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-background dark:bg-black">
        <LawGPTHeader
          onSidebarOpen={handleSidebarToggle}
          sidebarOpen={false}
        />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <LawGPTHeader
        onSidebarOpen={handleSidebarToggle}
        sidebarOpen={sidebarOpen}
      />
      <WowAhhAnimation />

      {sidebarOpen && (
        <LawGPTSidebar
          onClose={() => setSidebarOpen(false)}
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />
      )}

      {chatHistory.length === 0 ? (
        <div
          className="relative w-full h-full bg-background dark:bg-black font-body flex flex-col items-center justify-start overflow-hidden px-4"
          style={{ paddingTop: "clamp(100px, 20vh, 240px)" }}
        >
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 31 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-[31px] sm:h-[31px]"
            >
              <path
                d="M3.35028 11.6585C5.38323 9.62556 8.67069 9.61698 10.693 11.6393L14.0619 15.0082L10.7122 18.3579C8.67927 20.3908 5.39181 20.3994 3.36946 18.377L0.000606868 15.0082L3.35028 11.6585Z"
                fill="#3C9B97"
                fillOpacity="0.6"
              />
              <path
                d="M18.3581 3.34931C20.391 5.38225 20.3996 8.66971 18.3773 10.6921L15.0084 14.0609L11.6587 10.7112C9.6258 8.6783 9.61722 5.39083 11.6396 3.36848L15.0084 -0.000370287L18.3581 3.34931Z"
                fill="#3C9B97"
                fillOpacity="0.6"
              />
              <path
                d="M19.3044 11.6585C21.3373 9.62556 24.6248 9.61698 26.6471 11.6393L30.016 15.0082L26.6663 18.3579C24.6334 20.3908 21.3459 20.3994 19.3236 18.377L15.9547 15.0082L19.3044 11.6585Z"
                fill="#3C9B97"
                fillOpacity="0.6"
              />
              <path
                d="M18.4934 19.1696C20.5263 21.2026 20.5033 24.5216 18.4421 26.5828L15.0085 30.0164L11.6588 26.6668C9.62585 24.6338 9.64879 21.3148 11.71 19.2536L15.1437 15.8199L18.4934 19.1696Z"
                fill="#3C9B97"
                fillOpacity="0.6"
              />
            </svg>
            <span
              className="font-semibold text-base sm:text-[20px] leading-6 text-gray-600 dark:text-white/60"
              style={{ fontFamily: "Instrument Sans, sans-serif" }}
            >
              LawGPT
            </span>
          </div>

          <h1
            className="font-bold text-2xl sm:text-3xl lg:text-[40px] leading-tight sm:leading-[48px] text-gray-900 dark:text-white mb-6 sm:mb-8 text-center px-4"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            What can I help with
          </h1>

          <div
            className="relative mx-auto w-full"
            style={{
              maxWidth: "min(537px, calc(100vw - 2rem))",
              width: "100%",
              height: Math.max(
                132,
                textareaRef.current
                  ? textareaRef.current.scrollHeight + 80
                  : 132,
              ),
              minHeight: "132px",
            }}
          >
            <div
              className="absolute inset-0 bg-gray-100 dark:bg-[#232323] border-2 border-gray-200 dark:border-transparent shadow-lg dark:shadow-none"
              style={{
                borderRadius: "clamp(20px, 5vw, 28px)",
                height: Math.max(
                  132,
                  textareaRef.current
                    ? textareaRef.current.scrollHeight + 80
                    : 132,
                ),
              }}
            />

            <div className="absolute inset-0 flex flex-col justify-start px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white/80 placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none text-base sm:text-lg"
                    placeholder="Ask me anything about law"
                    value={message}
                    onFocus={(e) => {
                      // Check authentication when user tries to type
                      if (!isAuthChecking && (!isAuthenticated || !userId)) {
                        e.target.blur(); // Remove focus
                        showNotification(
                          "Please login or sign up to use LawGPT. You will be redirected to the login page.",
                          'info'
                        );
                        setTimeout(() => {
                          window.location.href = '/login';
                        }, 2000);
                      }
                    }}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      const textarea = e.target;
                      textarea.style.height = "auto";
                      const newHeight = Math.max(24, textarea.scrollHeight);
                      textarea.style.height = newHeight + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    style={{
                      fontSize: "clamp(16px, 4vw, 18px)",
                      lineHeight: "1.44",
                      fontFamily: "Instrument Sans, sans-serif",
                      fontWeight: "400",
                      padding: "0",
                      margin: "0",
                      minHeight: "24px",
                      maxHeight: "none",
                      overflowY: "hidden",
                      overflowX: "hidden",
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                <button
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#3C9B97] to-[#2d7773] hover:from-[#2d7773] hover:to-[#3C9B97] active:scale-95 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
                  onClick={handleSend}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 13C7.86739 13 7.74021 12.9473 7.64645 12.8536C7.55268 12.7598 7.5 12.6326 7.5 12.5L7.5 4.914L5.35355 7.06066C5.30631 7.1079 5.25 7.14504 5.1879 7.17025C5.12581 7.19547 5.05901 7.20826 4.99155 7.20826C4.92409 7.20826 4.85729 7.19547 4.7952 7.17025C4.7331 7.14504 4.67678 7.1079 4.62955 7.06066C4.58231 7.01343 4.54517 6.95711 4.51995 6.89502C4.49474 6.83292 4.48195 6.76612 4.48195 6.69866C4.48195 6.6312 4.49474 6.5644 4.51995 6.50231C4.54517 6.44021 4.58231 6.38389 4.62955 6.33666L7.62955 3.33666C7.67678 3.28942 7.7331 3.25228 7.7952 3.22707C7.85729 3.20185 7.92409 3.18906 7.99155 3.18906C8.05901 3.18906 8.12581 3.20185 8.1879 3.22707C8.25 3.25228 8.30632 3.28942 8.35355 3.33666L11.3536 6.33666C11.4008 6.38389 11.4379 6.44021 11.4632 6.50231C11.4884 6.5644 11.5012 6.6312 11.5012 6.69866C11.5012 6.76612 11.4884 6.83292 11.4632 6.89502C11.4379 6.95711 11.4008 7.01343 11.3536 7.06066C11.2598 7.15443 11.1326 7.20711 11 7.20711C10.9325 7.20711 10.8657 7.19432 10.8036 7.16911C10.7415 7.14389 10.6852 7.10675 10.638 7.05952L8.5 4.914L8.5 12.5C8.5 12.6326 8.44732 12.7598 8.35355 12.8536C8.25979 12.9473 8.13261 13 8 13Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full bg-background dark:bg-black font-body flex flex-col overflow-hidden">
          <div
            className="flex-1 flex flex-col"
            style={{ paddingTop: "clamp(80px, 15vh, 100px)", paddingBottom: "clamp(120px, 20vh, 140px)" }}
          >
            <div
              ref={chatContainerRef}
              className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 overflow-y-auto scrollbar-hide"
              style={{
                paddingBottom: "60px",
                maxHeight: "calc(100vh - 240px)",
              }}
            >
              <div className="space-y-6 sm:space-y-8">
                {chatHistory.map((chat, index) => (
                  <div key={chat.id} className="w-full">
                    {chat.type === "user" ? (
                      <div className="flex justify-end w-full">
                        <div className="max-w-[90%] sm:max-w-lg">
                          <AutoBubble
                            message={chat.content}
                            messageId={chat.id}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:gap-4 w-full">
                        <div
                          className="text-gray-700 dark:text-white/90 text-base sm:text-lg leading-relaxed sm:leading-7 prose prose-sm sm:prose-lg dark:prose-invert max-w-none"
                          style={{ fontFamily: "Instrument Sans, sans-serif" }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-6 mb-3 sm:mb-4 text-gray-900 dark:text-white" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-lg sm:text-xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 text-gray-900 dark:text-white" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-base sm:text-lg font-bold mt-3 sm:mt-4 mb-2 text-gray-900 dark:text-white" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2 sm:mb-3 text-gray-700 dark:text-white/90" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-4 sm:pl-6 mb-2 sm:mb-3 space-y-1" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal pl-4 sm:pl-6 mb-2 sm:mb-3 space-y-1" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="text-gray-700 dark:text-white/90 text-sm sm:text-base" {...props} />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong className="font-bold text-gray-900 dark:text-white" {...props} />
                              ),
                              em: ({ node, ...props }) => (
                                <em className="italic" {...props} />
                              ),
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => (
                                <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
                              ),
                              tbody: ({ node, ...props }) => (
                                <tbody {...props} />
                              ),
                              tr: ({ node, ...props }) => (
                                <tr className="border-b border-gray-300 dark:border-gray-600" {...props} />
                              ),
                              th: ({ node, ...props }) => (
                                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left font-bold text-xs sm:text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base text-gray-700 dark:text-white/90 border border-gray-300 dark:border-gray-600" {...props} />
                              ),
                              code: ({ node, inline, ...props }: any) => (
                                inline ? (
                                  <code className="bg-gray-100 dark:bg-gray-800 px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono" {...props} />
                                ) : (
                                  <code className="block bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded text-xs sm:text-sm font-mono overflow-x-auto" {...props} />
                                )
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-[#3C9B97] pl-4 my-3 italic text-gray-600 dark:text-gray-400" {...props} />
                              ),
                              hr: ({ node, ...props }) => (
                                <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
                              ),
                            }}
                          >
                            {chat.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )
                )}

                {aiLoading && (
                  <div className="flex flex-col gap-4 w-full">
                    <SkeletonLoader />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 flex justify-center z-50 backdrop-blur-sm">
            <div
              className="relative bg-gray-100 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 shadow-lg w-full"
              style={{ maxWidth: "min(537px, calc(100vw - 1.5rem))", height: "clamp(54px, 10vw, 62px)", borderRadius: "clamp(24px, 5vw, 31px)" }}
            >
              <div className="absolute inset-0 flex items-center px-4 sm:px-5 lg:px-6">
                <textarea
                  ref={bottomTextareaRef}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white font-medium resize-none placeholder:text-gray-500 dark:placeholder:text-white/50 text-sm sm:text-base lg:text-lg"
                  placeholder="Ask me anything about law"
                  value={message}
                  onFocus={(e) => {
                    // Check authentication when user tries to type
                    if (!isAuthChecking && (!isAuthenticated || !userId)) {
                      e.target.blur(); // Remove focus
                      showNotification(
                        "Please login or sign up to use LawGPT. You will be redirected to the login page.",
                        'info'
                      );
                      setTimeout(() => {
                        window.location.href = '/login';
                      }, 2000);
                    }
                  }}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  style={{
                    fontSize: "clamp(14px, 3.5vw, 18px)",
                    lineHeight: "1.5",
                    fontFamily: "Instrument Sans, sans-serif",
                    padding: "0",
                    margin: "0",
                    height: "24px",
                    maxHeight: "24px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                />

                <button
                  className="ml-3 sm:ml-4 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#3C9B97] to-[#2d7773] hover:from-[#2d7773] hover:to-[#3C9B97] active:scale-95 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-all shadow-md hover:shadow-lg"
                  onClick={handleSend}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 13C7.86739 13 7.74021 12.9473 7.64645 12.8536C7.55268 12.7598 7.5 12.6326 7.5 12.5L7.5 4.914L5.35355 7.06066C5.30631 7.1079 5.25 7.14504 5.1879 7.17025C5.12581 7.19547 5.05901 7.20826 4.99155 7.20826C4.92409 7.20826 4.85729 7.19547 4.7952 7.17025C4.7331 7.14504 4.67678 7.1079 4.62955 7.06066C4.58231 7.01343 4.54517 6.95711 4.51995 6.89502C4.49474 6.83292 4.48195 6.76612 4.48195 6.69866C4.48195 6.6312 4.49474 6.5644 4.51995 6.50231C4.54517 6.44021 4.58231 6.38389 4.62955 6.33666L7.62955 3.33666C7.67678 3.28942 7.7331 3.25228 7.7952 3.22707C7.85729 3.20185 7.92409 3.18906 7.99155 3.18906C8.05901 3.18906 8.12581 3.20185 8.1879 3.22707C8.25 3.25228 8.30632 3.28942 8.35355 3.33666L11.3536 6.33666C11.4008 6.38389 11.4379 6.44021 11.4632 6.50231C11.4884 6.5644 11.5012 6.6312 11.5012 6.69866C11.5012 6.76612 11.4884 6.83292 11.4632 6.89502C11.4379 6.95711 11.4008 7.01343 11.3536 7.06066C11.2598 7.15443 11.1326 7.20711 11 7.20711C10.9325 7.20711 10.8657 7.19432 10.8036 7.16911C10.7415 7.14389 10.6852 7.10675 10.638 7.05952L8.5 4.914L8.5 12.5C8.5 12.6326 8.44732 12.7598 8.35355 12.8536C8.25979 12.9473 8.13261 13 8 13Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Limit Modal - Mobile Optimized */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setShowLimitModal(false)}>
          <div className="bg-white dark:bg-card rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Daily Limit Reached</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-2">
                You've used all <strong>5 free messages</strong> for today.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                Come back tomorrow to continue your conversation with LawGPT!
              </p>
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> For unlimited legal assistance, book a consultation with one of our qualified lawyers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-muted hover:bg-muted/80 active:scale-95 rounded-lg font-medium transition-all text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = '/consult'}
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-primary hover:bg-primary/90 active:scale-95 text-white rounded-lg font-medium transition-all text-sm sm:text-base"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
