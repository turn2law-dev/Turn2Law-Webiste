"use client";

import { Phone, UserPlus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const actions = [
  {
    icon: Phone,
    label: "Call us",
    href: "tel:+917011637070",
    external: false,
  },
  {
    icon: UserPlus,
    label: "Consult",
    href: "/consult",
    external: false,
  },
  {
    icon: MessageSquare,
    label: "LawGPT",
    href: "/lawgpt",
    external: false,
  },
];

export default function FloatingActions() {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {actions.map(({ icon: Icon, label, href, external }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.6 + i * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Link
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="group relative flex h-14 w-14 items-center justify-center"
          >
            {/* Tooltip */}
            <span className="pointer-events-none absolute right-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-0.5">
              {label}
            </span>

            {/* Button */}
            <span
              className="
                relative flex h-14 w-14 items-center justify-center rounded-2xl
                bg-[#0D0D0D] text-white/75
                border border-white/[0.07]
                shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_4px_20px_rgba(0,0,0,0.5)]
                transition-all duration-300
                group-hover:text-white
                group-hover:scale-110
                group-hover:shadow-[0_0_0_1px_rgba(200,146,42,0.4),0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(200,146,42,0.2)]
                group-hover:bg-[#111]
                active:scale-95
              "
              style={{
                /* Gold bottom glow like the screenshot */
                boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.5), inset 0 -2px 0 rgba(200,146,42,0.6)",
              }}
            >
              {/* Inner gold bottom bar */}
              <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#C8922A]/80 to-transparent" />

              <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
