"use client";

import { motion, useReducedMotion } from "motion/react";

const Banner = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-background py-8 sm:py-12 md:py-16"
    >
      <div className="w-full overflow-hidden bg-[#DF9C49] py-3 sm:py-4 dark:bg-[#008882]">
        <div className="animate-scroll whitespace-nowrap">
          <div className="inline-flex items-center gap-8 text-white sm:gap-12 md:gap-16">
            {[
              "SELECT FROM EXPERT LAWYERS",
              "TRUSTED BY 100+ USERS",
              "MADE FOR INDIANS",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="h-2.5 w-2.5 rounded-full bg-white sm:h-3 sm:w-3" />
                <span className="font-body text-lg font-bold tracking-wide sm:text-xl md:text-2xl">
                  {text}
                </span>
              </div>
            ))}

            {[
              "SELECT FROM EXPERT LAWYERS",
              "TRUSTED BY 100+ USERS",
              "MADE FOR INDIANS",
            ].map((text, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-3 sm:gap-4">
                <div className="h-2.5 w-2.5 rounded-full bg-white sm:h-3 sm:w-3" />
                <span className="font-body text-lg font-bold tracking-wide sm:text-xl md:text-2xl">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          display: inline-block;
          animation: scroll 20s linear infinite;
        }

        @media (max-width: 768px) {
          .animate-scroll {
            animation-duration: 30s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </motion.section>
  );
};

export default Banner;
