"use client";

import { Clock, Handshake, Banknote, Video } from "lucide-react";
import { motion, useInView, useReducedMotion, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const features = [
  { icon: Clock, title: "Instant legal services", description: "Get agreements, contracts, NDAs and other legal documents quickly with transparency." },
  { icon: Handshake, title: "Lawyer Matching System", description: "Connect with expert lawyers tailored to your specific legal needs for seamless support." },
  { icon: Banknote, title: "Best-in-Class Pricing", description: "Access premium legal services at the most affordable rates with no hidden charges." },
  { icon: Video, title: "Virtual consulting", description: "Access expert legal advice and consultations anytime, anywhere, from the comfort of your home." },
];

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) { setDisplay(to); return; }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, prefersReducedMotion]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const About = () => {
  const prefersReducedMotion = useReducedMotion();
  const missionText = "Bridging the gap between legal expertise and accessibility through innovative technology.";
  const [typedMission, setTypedMission] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (!inView) { setTypedMission(""); return; }
    if (prefersReducedMotion) { setTypedMission(missionText); return; }
    setTypedMission("");
    let i = 0;
    const t = window.setInterval(() => {
      i++;
      setTypedMission(missionText.slice(0, i));
      if (i >= missionText.length) window.clearInterval(t);
    }, 22);
    return () => window.clearInterval(t);
  }, [inView, prefersReducedMotion]);

  return (
    <section id="about" className="section-with-orbs min-h-screen flex flex-col justify-center bg-background py-20 px-6 overflow-hidden">
      <div className="container mx-auto" ref={ref}>

        {/* Badge */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-5 py-2 text-xs font-medium text-foreground/60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          About us
        </motion.div>

        <div className="grid items-start gap-12 md:grid-cols-2">

          {/* Left — slides from left */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -100, filter: "blur(18px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.05, ease: EASE }}
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight">
              What&apos;s{" "}
              <span className="text-primary">Turn2Law</span>?
            </h2>
            <p className="mt-5 text-lg text-foreground/55 leading-relaxed max-w-md">
              A next-generation legal platform connecting you to trusted professionals and resources instantly, making justice accessible and affordable for all.
            </p>

            {/* Mission box */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
              className="mt-7 rounded-2xl glass-card glass-card-hover p-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-3">Our Mission</p>
              <p className={`text-base leading-relaxed text-foreground/65 ${typedMission.length < missionText.length ? "typing-caret" : ""}`}>
                {typedMission}
              </p>
            </motion.div>
          </motion.div>

          {/* Right — slides from right */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 100, filter: "blur(18px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
          >
            {/* Stats — count-up */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: "Verified Lawyers", to: 200, suffix: "+" },
                { label: "Trusted Platform", to: 100, suffix: "%" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl glass-card glass-card-hover p-6">
                  <div className="text-5xl font-bold text-primary leading-none">
                    <CountUp to={s.to} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-sm text-foreground/50">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 60, scale: 0.85 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.9, delay: i * 0.13, ease: EASE }}
                  className="rounded-2xl glass-card glass-card-hover p-5"
                >
                  <div className="mb-3 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-primary" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="text-lg font-bold text-primary leading-snug">{f.title}</h3>
                  <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .typing-caret::after {
          content: "";
          display: inline-block;
          width: 1px;
          height: 1em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: currentColor;
          animation: blink 1s steps(2, end) infinite;
        }
        @keyframes blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
      `}</style>
    </section>
  );
};

export default About;
