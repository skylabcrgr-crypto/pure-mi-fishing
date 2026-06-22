"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Waves } from "lucide-react";

const PERKS = [
  "First access to Detroit River offline maps",
  "Regulation summaries for 7 species",
  "6 mapped boat launches",
  "Trip mode & catch log",
  "Weather & water conditions snapshot",
  "Ice mode and spearfishing info",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function CtaSection() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="py-24 bg-[#050f1d] px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Animated water rings */}
      {[240, 400, 580, 760].map((size, i) => (
        <motion.div
          key={size}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00acc1] pointer-events-none"
          style={{ width: size, height: size, opacity: 0.04 - i * 0.007 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{
            duration: 5 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}

      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,172,193,0.1) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col items-center gap-10 text-center"
        >
          {/* Icon */}
          <motion.div variants={fadeUp}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00acc1] to-[#003da5] flex items-center justify-center shadow-2xl shadow-[#00acc1]/25">
              <Waves size={28} className="text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Headline */}
          <div>
            <motion.p
              variants={fadeUp}
              className="text-[#00acc1] text-xs font-bold uppercase tracking-widest mb-3"
            >
              Early Access
            </motion.p>
            <motion.h2
              id="cta-heading"
              variants={fadeUp}
              className="text-3xl sm:text-5xl font-extrabold text-[#f0f9ff] leading-tight mb-4"
            >
              Help shape the future of{" "}
              <span className="text-gradient-teal">Michigan fishing tech.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#3d6070] text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
            >
              Be among the first anglers to test Pure MI Fishing on the
              Detroit River. Early access members shape the feature roadmap
              and help build the best offline fishing companion in Michigan.
            </motion.p>
          </div>

          {/* Perks list */}
          <motion.ul
            variants={stagger}
            className="grid sm:grid-cols-2 gap-2.5 text-left max-w-lg w-full"
            aria-label="Early access features"
          >
            {PERKS.map((perk) => (
              <motion.li
                key={perk}
                variants={fadeUp}
                className="flex items-start gap-2.5 text-sm text-[#3d6070]"
              >
                <span className="text-[#00acc1] mt-0.5 flex-shrink-0">✓</span>
                {perk}
              </motion.li>
            ))}
          </motion.ul>

          {/* Form — static, no backend */}
          <motion.div
            variants={fadeUp}
            className="w-full max-w-md flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address for early access"
                className="flex-1 bg-[#0a1628] border border-[#1e3a5f] text-[#f0f9ff] placeholder-[#1e3a5f] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#00acc1] focus:ring-1 focus:ring-[#00acc1]/50 transition-all"
                readOnly
              />
              <button
                type="button"
                className="group inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#ff7d42] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#ff6b35]/20 hover:shadow-[#ff7d42]/25 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050f1d] whitespace-nowrap"
                onClick={() => alert("Early access list coming soon — check back!")}
              >
                Join Early Access
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>
            <p className="text-[#1e3a5f] text-xs text-center">
              No spam. No account required. Unsubscribe any time.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
