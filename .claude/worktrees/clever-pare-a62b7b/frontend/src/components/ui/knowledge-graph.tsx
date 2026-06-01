"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  r: number;
  type: "hub" | "main" | "sub";
  href?: string;
  color: string;
  textColor: string;
}

interface GraphEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

const nodes: GraphNode[] = [
  // Hub
  { id: "hub", label: "Turn2Law", sublabel: "Legal Platform", x: 450, y: 250, r: 44, type: "hub", href: "/", color: "#C8922A", textColor: "#fff" },

  // Main nodes
  { id: "navigator", label: "Legal", sublabel: "Navigator", x: 450, y: 72, r: 32, type: "main", href: "/legal-navigator", color: "#3b82f6", textColor: "#fff" },
  { id: "services", label: "Services", x: 724, y: 152, r: 32, type: "main", href: "/services", color: "#8b5cf6", textColor: "#fff" },
  { id: "documents", label: "Document", sublabel: "Drafting", x: 694, y: 390, r: 32, type: "main", href: "/documents", color: "#10b981", textColor: "#fff" },
  { id: "lawgpt", label: "LawGPT", x: 206, y: 390, r: 32, type: "main", href: "/lawgpt", color: "#f59e0b", textColor: "#fff" },
  { id: "consult", label: "Consult", x: 176, y: 152, r: 32, type: "main", href: "/consult", color: "#ec4899", textColor: "#fff" },

  // Navigator sub-nodes
  { id: "consumer", label: "Consumer", sublabel: "Rights", x: 302, y: 22, r: 22, type: "sub", href: "/legal-navigator", color: "#1d4ed8", textColor: "#fff" },
  { id: "criminal", label: "Criminal", x: 450, y: 10, r: 22, type: "sub", href: "/legal-navigator", color: "#1d4ed8", textColor: "#fff" },
  { id: "civil", label: "Civil", x: 598, y: 22, r: 22, type: "sub", href: "/legal-navigator", color: "#1d4ed8", textColor: "#fff" },

  // Services sub-nodes
  { id: "gst", label: "GST", x: 856, y: 82, r: 20, type: "sub", href: "/services/gst-registration", color: "#5b21b6", textColor: "#fff" },
  { id: "company", label: "Company", sublabel: "Reg.", x: 878, y: 165, r: 20, type: "sub", href: "/services/private-limited", color: "#5b21b6", textColor: "#fff" },
  { id: "llp", label: "LLP", x: 856, y: 248, r: 20, type: "sub", href: "/services/llp", color: "#5b21b6", textColor: "#fff" },

  // Documents sub-nodes
  { id: "nda", label: "NDA", x: 810, y: 450, r: 20, type: "sub", href: "/documents/nda", color: "#065f46", textColor: "#fff" },
  { id: "employment", label: "Employment", x: 728, y: 482, r: 20, type: "sub", href: "/documents/employment", color: "#065f46", textColor: "#fff" },

  // LawGPT sub-nodes
  { id: "aichat", label: "AI Chat", x: 90, y: 450, r: 20, type: "sub", href: "/lawgpt", color: "#92400e", textColor: "#fff" },
  { id: "research", label: "Research", x: 172, y: 482, r: 20, type: "sub", href: "/lawgpt", color: "#92400e", textColor: "#fff" },

  // Consult sub-nodes
  { id: "bookcall", label: "Free Call", x: 44, y: 82, r: 20, type: "sub", href: "/consult", color: "#9d174d", textColor: "#fff" },
  { id: "lawyermatch", label: "Lawyer", sublabel: "Match", x: 22, y: 165, r: 20, type: "sub", href: "/consult", color: "#9d174d", textColor: "#fff" },
];

const edges: GraphEdge[] = [
  // Hub to main
  { from: "hub", to: "navigator" },
  { from: "hub", to: "services" },
  { from: "hub", to: "documents" },
  { from: "hub", to: "lawgpt" },
  { from: "hub", to: "consult" },

  // Main to sub
  { from: "navigator", to: "consumer", dashed: true },
  { from: "navigator", to: "criminal", dashed: true },
  { from: "navigator", to: "civil", dashed: true },

  { from: "services", to: "gst", dashed: true },
  { from: "services", to: "company", dashed: true },
  { from: "services", to: "llp", dashed: true },

  { from: "documents", to: "nda", dashed: true },
  { from: "documents", to: "employment", dashed: true },

  { from: "lawgpt", to: "aichat", dashed: true },
  { from: "lawgpt", to: "research", dashed: true },

  { from: "consult", to: "bookcall", dashed: true },
  { from: "consult", to: "lawyermatch", dashed: true },
];

const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

function getEdgePath(from: GraphNode, to: GraphNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const x1 = from.x + ux * from.r;
  const y1 = from.y + uy * from.r;
  const x2 = to.x - ux * to.r;
  const y2 = to.y - uy * to.r;
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export default function KnowledgeGraph() {
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  return (
    <section className="py-20 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C8922A] mb-3 font-body">
            Legal Ecosystem
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
            Everything connected,{" "}
            <span className="text-[#C8922A]">one platform.</span>
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto font-body">
            Every legal need — from navigating courts to drafting contracts — is interconnected within Turn2Law.
          </p>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox="0 0 900 520"
            className="w-full max-w-4xl mx-auto"
            style={{ minWidth: 340 }}
          >
            <defs>
              {/* Hub glow */}
              <filter id="glow-hub">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-main">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="grad-hub" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#f0b429" />
                <stop offset="100%" stopColor="#C8922A" />
              </radialGradient>
            </defs>

            {/* Edges */}
            {edges.map((e, i) => {
              const from = nodeMap[e.from];
              const to = nodeMap[e.to];
              if (!from || !to) return null;
              const isActive = hovered === e.from || hovered === e.to;
              return (
                <path
                  key={i}
                  d={getEdgePath(from, to)}
                  stroke={isActive ? to.color : "rgba(255,255,255,0.12)"}
                  strokeWidth={isActive ? 1.5 : 1}
                  strokeDasharray={e.dashed ? "4 4" : undefined}
                  fill="none"
                  style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                />
              );
            })}

            {/* Sub-nodes */}
            {nodes
              .filter((n) => n.type === "sub")
              .map((node) => {
                const isHovered = hovered === node.id;
                return (
                  <g
                    key={node.id}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => node.href && router.push(node.href)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + (isHovered ? 3 : 0)}
                      fill={node.color}
                      opacity={isHovered ? 1 : 0.7}
                      style={{ transition: "r 0.15s, opacity 0.15s" }}
                    />
                    <text
                      x={node.x}
                      y={node.y + (node.sublabel ? -3 : 4)}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={9}
                      fontWeight="600"
                      fontFamily="system-ui"
                      style={{ pointerEvents: "none" }}
                    >
                      {node.label}
                    </text>
                    {node.sublabel && (
                      <text
                        x={node.x}
                        y={node.y + 8}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={8}
                        fontFamily="system-ui"
                        style={{ pointerEvents: "none" }}
                      >
                        {node.sublabel}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Main nodes */}
            {nodes
              .filter((n) => n.type === "main")
              .map((node) => {
                const isHovered = hovered === node.id;
                return (
                  <g
                    key={node.id}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => node.href && router.push(node.href)}
                  >
                    {/* Glow ring on hover */}
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={1.5}
                        opacity={0.4}
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + (isHovered ? 4 : 0)}
                      fill={node.color}
                      filter="url(#glow-main)"
                      style={{ transition: "r 0.15s" }}
                    />
                    <text
                      x={node.x}
                      y={node.y + (node.sublabel ? -4 : 5)}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={11}
                      fontWeight="700"
                      fontFamily="system-ui"
                      style={{ pointerEvents: "none" }}
                    >
                      {node.label}
                    </text>
                    {node.sublabel && (
                      <text
                        x={node.x}
                        y={node.y + 9}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.8)"
                        fontSize={9}
                        fontFamily="system-ui"
                        style={{ pointerEvents: "none" }}
                      >
                        {node.sublabel}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Hub node (rendered last = on top) */}
            {(() => {
              const node = nodeMap["hub"];
              const isHovered = hovered === "hub";
              return (
                <g
                  key="hub"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered("hub")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => router.push("/")}
                >
                  {/* Pulse ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 16}
                    fill="none"
                    stroke="#C8922A"
                    strokeWidth={1}
                    opacity={0.2}
                  >
                    <animate
                      attributeName="r"
                      from={node.r + 10}
                      to={node.r + 24}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from={0.3}
                      to={0}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + (isHovered ? 5 : 0)}
                    fill="url(#grad-hub)"
                    filter="url(#glow-hub)"
                    style={{ transition: "r 0.15s" }}
                  />
                  <text
                    x={node.x}
                    y={node.y - 3}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={13}
                    fontWeight="800"
                    fontFamily="system-ui"
                    style={{ pointerEvents: "none" }}
                  >
                    Turn2Law
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.65)"
                    fontSize={8}
                    fontFamily="system-ui"
                    style={{ pointerEvents: "none" }}
                  >
                    Legal Platform
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {[
            { color: "#3b82f6", label: "Legal Navigator" },
            { color: "#8b5cf6", label: "Services" },
            { color: "#10b981", label: "Document Drafting" },
            { color: "#f59e0b", label: "LawGPT" },
            { color: "#ec4899", label: "Consult" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-white/40 font-body">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
