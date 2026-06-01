"use client";

import { Clock, Handshake, Banknote, Video } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Clock,
    title: "Instant legal services",
    description:
      "Get agreements, contracts, NDAs and other legal documents quickly with transparency.",
    iconColor: "text-[#DF9C49]",
  },
  {
    icon: Handshake,
    title: "Lawyer Matching System",
    description:
      "Connect with expert lawyers tailored to your specific legal needs for seamless support.",
    iconColor: "text-[#DF9C49]",
  },
  {
    icon: Banknote,
    title: "Best-in-Class Pricing",
    description:
      "Access premium legal services at the most affordable rates with no hidden charges.",
    iconColor: "text-[#DF9C49]",
  },
  {
    icon: Video,
    title: "Virtual consulting",
    description:
      "Access expert legal advice and consultations anytime, anywhere, from the comfort of your home.",
    iconColor: "text-[#DF9C49]",
  },
];

const About = () => {
  const prefersReducedMotion = useReducedMotion();
  const aboutRef = useRef<HTMLDivElement>(null);
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.45 });
  const missionText =
    "Bridging the gap between legal expertise and accessibility through innovative technology.";
  const [typedMission, setTypedMission] = useState("");

  useEffect(() => {
    if (!aboutInView) {
      setTypedMission("");
      return;
    }

    if (prefersReducedMotion) {
      setTypedMission(missionText);
      return;
    }

    setTypedMission("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedMission(missionText.slice(0, index));
      if (index >= missionText.length) {
        window.clearInterval(timer);
      }
    }, 32);

    return () => window.clearInterval(timer);
  }, [aboutInView, prefersReducedMotion, missionText]);

  return (
    <section id="about" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          ref={aboutRef}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-3xl border border-border/40 bg-muted/20 p-4 shadow-[0_24px_80px_-60px_rgba(0,0,0,0.35)] sm:p-6 md:p-10"
        >
          <div className="grid items-start gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <h2 className="text-4xl font-body font-bold leading-[1.05] md:text-5xl">
                What&apos;s <span className="text-primary">Turn2Law</span>?
              </h2>
              <p className="mt-5 max-w-[52ch] font-body text-base leading-relaxed text-foreground/80 md:text-lg">
                A next-generation legal platform connecting you to trusted professionals and resources instantly, making justice accessible and affordable for all.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.06, ease: "easeOut" }}
                  className="rounded-2xl border border-primary/20 bg-background/90 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-28px_rgba(223,156,73,0.75)]"
                >
                  <div className="text-4xl font-bold leading-none text-primary md:text-5xl">24/7</div>
                  <div className="mt-3 text-sm font-medium tracking-[0.01em] text-foreground/70 md:text-base">
                    Legal Support
                  </div>
                </motion.div>

                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
                  className="rounded-2xl border border-primary/20 bg-background/90 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-28px_rgba(223,156,73,0.75)]"
                >
                  <div className="text-4xl font-bold leading-none text-primary md:text-5xl">100%</div>
                  <div className="mt-3 text-sm font-medium tracking-[0.01em] text-foreground/70 md:text-base">
                    Trusted Platform
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
                className="mt-7 rounded-xl border border-primary/20 bg-background/65 px-5 py-4"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                  Our Mission
                </p>
                <p
                  className={`mt-2 max-w-[54ch] font-body text-sm leading-relaxed text-foreground/72 md:text-[0.95rem] ${
                    typedMission.length < missionText.length
                      ? "about-typing-caret"
                      : ""
                  }`}
                >
                  {typedMission}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className="md:px-1"
            >
              <div className="space-y-3.5">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: prefersReducedMotion ? 0 : 22,
                      scale: prefersReducedMotion ? 1 : 0.985,
                      filter: prefersReducedMotion ? "none" : "blur(4px)",
                    }}
                    animate={
                      aboutInView
                        ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                        : { opacity: 0, y: prefersReducedMotion ? 0 : 22, scale: prefersReducedMotion ? 1 : 0.985, filter: prefersReducedMotion ? "none" : "blur(4px)" }
                    }
                    transition={{
                      duration: 0.55,
                      delay: aboutInView ? index * 0.16 : 0,
                      ease: "easeOut",
                    }}
                    className="group relative rounded-xl border border-border/30 bg-background/92 p-4 backdrop-blur-sm transition-all duration-250 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_14px_30px_-24px_rgba(0,0,0,0.45)]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 dark:bg-primary/20">
                        <feature.icon className={`h-4.5 w-4.5 ${feature.iconColor}`} />
                      </div>
                      <div className="pr-1">
                        <h3 className="text-[1.35rem] font-body font-semibold leading-tight text-foreground">
                          {feature.title}
                        </h3>
                        <p className="mt-1.5 font-body text-[0.95rem] leading-relaxed text-foreground/68">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        .about-typing-caret::after {
          content: "";
          display: inline-block;
          width: 1px;
          height: 1.1em;
          margin-left: 3px;
          vertical-align: text-bottom;
          background: rgba(223, 156, 73, 0.9);
          animation: aboutCaretBlink 1s steps(2, end) infinite;
        }

        @keyframes aboutCaretBlink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default About;
