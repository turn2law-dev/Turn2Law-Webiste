"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MessageSquare, Briefcase, FileText, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

const dockItems = [
  { id: "consult",    icon: Phone,         label: "Consult",       sublabel: "Speak to a lawyer",      href: "/consult"         },
  { id: "lawgpt",     icon: MessageSquare, label: "LawGPT",        sublabel: "AI legal assistant",     href: "/lawgpt"          },
  { id: "services",   icon: Briefcase,     label: "Services",      sublabel: "GST, registration & more", href: "/services"      },
  { id: "documents",  icon: FileText,      label: "Documentation", sublabel: "Draft legal documents",  href: "/documents"       },
  { id: "navigator",  icon: Navigation,    label: "Navigator",     sublabel: "Find legal guidance",    href: "/legal-navigator" },
];

export default function RightDock() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 w-[56px]">
      {dockItems.map((item) => {
        const isHovered = hoveredId === item.id;
        const Icon = item.icon;

        return (
          /* Fixed-size slot — never changes, keeps siblings in place */
          <div key={item.id} className="relative w-[56px] h-[56px]">
          <motion.button
            onClick={() => router.push(item.href)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="absolute right-0 top-0 flex items-center justify-end overflow-hidden focus:outline-none cursor-pointer rounded-2xl"
            animate={{ width: isHovered ? 210 : 56 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ height: 56 }}
            aria-label={item.label}
          >
            {/* Card background */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                borderLeft: "1px solid rgba(255,255,255,0.07)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            />

            {/* Gold bottom line — brighter on hover */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{
                background: isHovered
                  ? "linear-gradient(90deg, rgba(200,146,42,1) 0%, rgba(200,146,42,0.5) 80%, transparent 100%)"
                  : "linear-gradient(90deg, rgba(200,146,42,0.55) 0%, rgba(200,146,42,0.12) 100%)",
                transition: "background 0.25s ease",
              }}
            />

            {/* Label — fades in from right when hovered */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  key="label"
                  className="absolute left-0 pl-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.18, delay: 0.08, ease: EASE }}
                >
                  <p className="text-[13px] font-semibold text-white leading-none whitespace-nowrap">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap">
                    {item.sublabel}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon — always right-anchored */}
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-[56px] h-[56px]">
              <Icon
                strokeWidth={1.5}
                style={{
                  width: 20,
                  height: 20,
                  color: isHovered ? "#C8922A" : "rgba(255,255,255,0.7)",
                  transition: "color 0.2s ease",
                }}
              />
            </div>
          </motion.button>
          </div>
        );
      })}
    </div>
  );
}
