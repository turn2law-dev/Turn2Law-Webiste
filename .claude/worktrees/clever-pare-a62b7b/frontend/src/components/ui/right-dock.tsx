"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, UserPlus, MessageSquare, Briefcase, FileText, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

interface DockItem {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  href: string;
}

const dockItems: DockItem[] = [
  {
    id: "consult",
    icon: Phone,
    label: "Consult",
    sublabel: "Speak to a lawyer",
    href: "/consult",
  },
  {
    id: "lawgpt",
    icon: MessageSquare,
    label: "LawGPT",
    sublabel: "AI legal assistant",
    href: "/lawgpt",
  },
  {
    id: "services",
    icon: Briefcase,
    label: "Services",
    sublabel: "GST, registration & more",
    href: "/services",
  },
  {
    id: "documents",
    icon: FileText,
    label: "Documentation",
    sublabel: "Draft legal documents",
    href: "/documents",
  },
  {
    id: "navigator",
    icon: Navigation,
    label: "Navigator",
    sublabel: "Find legal guidance",
    href: "/legal-navigator",
  },
];

export default function RightDock() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = (item: DockItem) => {
    if (activeId === item.id) {
      // Second click → navigate
      router.push(item.href);
    } else {
      setActiveId(item.id);
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pr-0">
      {dockItems.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            onClick={() => handleClick(item)}
            onBlur={() => {/* keep open */}}
            className="relative flex items-center justify-end overflow-hidden focus:outline-none"
            animate={{ width: isActive ? 220 : 58 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{ height: 58 }}
            aria-label={item.label}
          >
            {/* Dark card background */}
            <div className="absolute inset-0 rounded-l-2xl"
              style={{
                background: "linear-gradient(135deg, #111111 0%, #0a0a0a 100%)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                borderLeft: "1px solid rgba(255,255,255,0.07)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            />

            {/* Gold bottom glow line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-sm"
              style={{
                background: isActive
                  ? "linear-gradient(90deg, rgba(200,146,42,0.9) 0%, rgba(200,146,42,0.4) 100%)"
                  : "linear-gradient(90deg, rgba(200,146,42,0.6) 0%, rgba(200,146,42,0.15) 100%)",
                transition: "background 0.3s ease",
              }}
            />

            {/* Expanded label — left side */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  key="label"
                  className="absolute left-0 flex items-center gap-3 pl-4 pr-3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.22, delay: 0.1, ease: EASE }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-none whitespace-nowrap">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-white/45 mt-0.5 whitespace-nowrap">
                      {item.sublabel}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon — always on the right */}
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-[58px] h-[58px]">
              <Icon
                style={{ width: 22, height: 22, color: isActive ? "#C8922A" : "rgba(255,255,255,0.75)" }}
                strokeWidth={1.5}
              />
            </div>
          </motion.button>
        );
      })}

      {/* Dismiss on outside area — invisible overlay */}
      {activeId && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setActiveId(null)}
        />
      )}
    </div>
  );
}
