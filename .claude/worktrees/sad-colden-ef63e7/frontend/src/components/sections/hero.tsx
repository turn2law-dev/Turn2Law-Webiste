"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

const Hero = () => {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleConsultClick = async () => {
    // Check if user is logged in using Supabase Auth
    try {
      const { getSession } = await import("@/lib/supabase-auth");
      const session = await getSession();

      if (session && session.user) {
        // User is logged in, redirect to consult page
        router.push("/consult");
      } else {
        // User is not logged in, redirect to login page
        router.push("/login");
      }
    } catch (error) {
      // If error checking auth, redirect to login to be safe
      router.push("/login");
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-background pt-20 pb-10 sm:pt-24 md:pt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-gradient-orb hero-gradient-orb-left" />
        <div className="hero-gradient-orb hero-gradient-orb-right" />
        <div className="hero-grid-overlay" />
      </div>

      <div className="container relative z-10 mx-auto grid items-center gap-10 px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
        <div className="text-foreground">
          <motion.p
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/90"
          >
            Private Legal Intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: "easeOut" }}
            className="mb-5 max-w-[18ch] text-4xl font-headline font-semibold leading-[1.02] sm:text-5xl md:text-6xl"
          >
            <span className="block">We Simplify Legal</span>
            <span className="block">
              Access for{" "}
              <span className="hero-word-inline" aria-label="Everyone.">
                <span className="sr-only">Everyone.</span>
                {"Everyone.".split("").map((char, idx) => (
                  <span
                    key={`hero-letter-${idx}`}
                    aria-hidden="true"
                    className="hero-letter"
                    style={{ animationDelay: `${idx * 0.085}s` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.1, ease: "easeOut" }}
            className="mb-8 max-w-[46ch] font-body text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Find high-quality lawyers which suits you, with help of AI tools
            that get the justice right on time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5"
          >
            <Button
              size="lg"
              className="h-14 rounded-full bg-[#D8A04A] px-8 font-body text-base font-semibold text-white shadow-[0_12px_28px_-18px_rgba(216,160,74,0.8)] hover:bg-[#D8A04A]/90"
              onClick={handleConsultClick}
            >
              Consult a Lawyer
            </Button>

            <div className="flex flex-col">
              <Link href="/lawgpt">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-[#17726E]/40 bg-[#17726E]/10 px-8 font-body text-base font-semibold text-[#17726E] hover:bg-[#17726E]/15"
                >
                  Try LawGPT
                </Button>
              </Link>
              <p className="mt-2 pl-3 text-xs font-medium tracking-[0.08em] text-muted-foreground">
                24/7 AI support
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.15, ease: "easeOut" }}
          className="relative h-[300px] w-full sm:h-[380px] md:h-[460px]"
        >
          <div className="group relative h-full w-full">
            <div className="hero-image-glow absolute -inset-6 rounded-3xl" />

            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/35 bg-card/35 shadow-[0_36px_90px_-52px_rgba(0,0,0,0.7)] backdrop-blur-sm">
              <Image
                src="/images/landingpagephoto.png"
                alt="Professional Legal Services"
                fill
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/22 via-transparent to-black/10" />
              <div className="hero-shine-pass absolute inset-y-0 w-1/3" />
              <div className="hero-noise-overlay absolute inset-0" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 shadow-inner" />
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .hero-gradient-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(86px);
          opacity: 0.2;
        }

        .hero-gradient-orb-left {
          width: 320px;
          height: 320px;
          top: 10%;
          left: -7%;
          background: radial-gradient(
            circle,
            rgba(223, 156, 73, 0.24),
            rgba(223, 156, 73, 0)
          );
        }

        .hero-gradient-orb-right {
          width: 360px;
          height: 360px;
          right: -11%;
          bottom: 8%;
          background: radial-gradient(
            circle,
            rgba(23, 114, 110, 0.16),
            rgba(23, 114, 110, 0)
          );
        }

        .hero-grid-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at center, black, transparent 76%);
        }

        .hero-image-glow {
          background: linear-gradient(
            125deg,
            rgba(223, 156, 73, 0.12),
            rgba(23, 114, 110, 0.1),
            transparent 70%
          );
          filter: blur(24px);
        }

        .hero-shine-pass {
          left: -35%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.14),
            transparent
          );
          animation: shinePass 1.6s ease-out 0.55s 1 both;
          will-change: transform;
        }

        .hero-noise-overlay {
          opacity: 0.05;
          background-image: radial-gradient(rgba(255, 255, 255, 0.45) 0.5px, transparent 0.5px);
          background-size: 2px 2px;
          mix-blend-mode: soft-light;
        }

        .hero-word-inline {
          display: inline-block;
          color: hsl(var(--primary));
        }

        .hero-letter {
          display: inline-block;
          color: hsl(var(--primary));
          animation: letterGlow 1.85s ease-in-out infinite;
          will-change: text-shadow, color;
        }

        @keyframes shinePass {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateX(420%);
            opacity: 0;
          }
        }

        @keyframes letterGlow {
          0% {
            text-shadow: none;
            color: hsl(var(--primary));
          }
          26% {
            text-shadow: 0 0 0 rgba(255, 232, 186, 0);
            color: hsl(var(--primary));
          }
          46% {
            text-shadow: 0 0 14px rgba(255, 232, 186, 0.8);
            color: #f3c87e;
          }
          100% {
            text-shadow: none;
            color: hsl(var(--primary));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-shine-pass {
            animation: none;
            opacity: 0;
          }
          .hero-letter {
            animation: none;
            text-shadow: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
