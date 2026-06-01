"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

/* ─── Easing ────────────────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Word-blur reveal ──────────────────────────────────────────────────────── */
function BlurRevealText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 60, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1.0,
            delay: delay + i * 0.12,
            ease: EASE,
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── Animated gradient orb ─────────────────────────────────────────────────── */
function Orb({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 18, 0],
        scale: [1, 1.08, 0.95, 1],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
const Hero = () => {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleConsultClick = async () => {
    try {
      const { getSession } = await import("@/lib/supabase-auth");
      const session = await getSession();
      router.push(session?.user ? "/consult" : "/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/hero-bg.jpg'), url('/images/landingpagephoto.png')",
        }}
      />

      {/* Gradient overlay — layered for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Animated orbs */}
      <Orb
        className="w-[520px] h-[520px] bg-[#C8922A]/18 top-[-120px] left-[-160px]"
        delay={0}
      />
      <Orb
        className="w-[400px] h-[400px] bg-[#C8922A]/12 bottom-[-80px] right-[-100px]"
        delay={4}
      />
      <Orb
        className="w-[300px] h-[300px] bg-blue-500/8 top-[30%] right-[10%]"
        delay={8}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top-left Logo */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2"
      >
        <svg width="22" height="28" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.2048 0L11.4096 6.19541L13.4028 8.16545L15.8223 5.57886V20.2762L2.51237 6.72721C1.58129 5.77941 0 6.45738 0 7.80434V30H2.76506V10.9846L16.075 24.5337C17.006 25.4814 18.5874 24.8036 18.5874 23.4565V5.57886L21.0069 8.16545L23 6.19541L17.2048 0Z"
            fill="white"
          />
        </svg>
        <span className="font-semibold text-base tracking-tight text-white">Turn2Law</span>
      </motion.div>

      {/* Top-right Login / Signup */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="absolute top-6 right-6 z-20 flex items-center gap-3"
      >
        <Link
          href="/login"
          className="text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-[#C8922A] hover:bg-[#b5801f] text-white text-sm font-semibold px-6 py-2.5 shadow-[0_4px_14px_rgba(200,146,42,0.45)] hover:shadow-[0_6px_20px_rgba(200,146,42,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Signup
        </Link>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Headline — word-by-word blur reveal */}
        <h1 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tight text-white">
          <BlurRevealText text="We Simplify Legal" delay={0.05} />
          <br />
          <BlurRevealText text="Access for" delay={0.22} />{" "}
          <motion.span
            className="text-[#C8922A] inline-block"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 60, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.0, delay: 0.6, ease: EASE }}
          >
            Everyone.
          </motion.span>
        </h1>

        {/* Subtext */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 50, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, delay: 0.7, ease: EASE }}
          className="mt-7 max-w-xl text-base sm:text-lg text-white/60 leading-relaxed"
        >
          Find high-quality lawyers which suits you, with help of AI tools
          that get the justice right on time.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.9, ease: EASE }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Primary */}
          <button
            onClick={handleConsultClick}
            className="group relative overflow-hidden rounded-full bg-[#C8922A] px-10 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(200,146,42,0.55)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_48px_rgba(200,146,42,0.7)] active:scale-95"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <span className="relative flex items-center gap-2">
              Consult a Lawyer
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </button>

          {/* Secondary */}
          <Link href="/lawgpt">
            <button className="group flex items-center gap-3 rounded-full border border-white/30 bg-white/8 px-9 py-4 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/16 hover:border-white/50 hover:scale-105 active:scale-95">
              Try LawGPT
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/75 transition-colors duration-300 group-hover:bg-white/25">
                24/7 AI
              </span>
            </button>
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 1.2, ease: EASE }}
          className="mt-16 flex items-center gap-8 sm:gap-12"
        >
          {[
            { value: "200+", label: "Verified Lawyers" },
            { value: "24/7", label: "Legal Support" },
            { value: "100%", label: "Trusted Platform" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-white/45 mt-0.5 tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/35 tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent"
          animate={{ scaleY: [0, 1], opacity: [0, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
};

export default Hero;
