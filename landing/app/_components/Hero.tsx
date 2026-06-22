"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight, ChevronDown } from "lucide-react";
import type { Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.13, delayChildren: 0.25 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const RINGS = [280, 460, 640, 840, 1060];

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-[100dvh] flex flex-col bg-[#050f1d] overflow-hidden"
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Radial vignette over grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 55%, transparent 25%, #050f1d 80%)",
        }}
      />

      {/* Teal glow — top right */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-8%",
          width: "52vw",
          height: "52vw",
          maxWidth: 720,
          maxHeight: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,172,193,0.18) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Michigan blue glow — bottom left */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: "5%",
          left: "-10%",
          width: "44vw",
          height: "44vw",
          maxWidth: 600,
          maxHeight: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,61,165,0.22) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      />

      {/* Concentric water rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {RINGS.map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-[#00acc1]"
            style={{
              width: size,
              height: size,
              opacity: 0.05 - i * 0.006,
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{
              duration: 6 + i * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center gap-7"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase"
              style={{
                background: "rgba(0,172,193,0.08)",
                borderColor: "rgba(0,172,193,0.22)",
                color: "#67e8f9",
              }}
            >
              <MapPin size={10} strokeWidth={3} />
              Independent App &nbsp;·&nbsp; Detroit River MVP &nbsp;·&nbsp; Michigan
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-[2.6rem] sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.06] text-[#f0f9ff]"
          >
            Fish Michigan Smarter —{" "}
            <span className="text-gradient-teal">
              Even When Service Drops.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={item}
            className="text-[#7a9eb8] text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl"
          >
            Pure MI Fishing is an independent field companion for Detroit River
            anglers — offline-ready maps, boat launch points, simplified rules,
            water conditions, and trip tools{" "}
            <strong className="text-[#a8c8de] font-semibold">
              built for real days on the water.
            </strong>
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center gap-4 pt-1"
          >
            <a
              href="#cta"
              className="group inline-flex items-center gap-2.5 bg-[#ff6b35] hover:bg-[#ff7d42] text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-[#ff6b35]/20 hover:shadow-[#ff7d42]/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050f1d]"
            >
              Join Early Access
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="#detroit"
              className="inline-flex items-center gap-2 border border-[#1e3a5f] text-[#7a9eb8] hover:text-[#f0f9ff] hover:border-[#00acc1]/40 font-semibold text-base px-8 py-3.5 rounded-xl transition-all hover:bg-[#00acc1]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00acc1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050f1d]"
            >
              View Detroit River MVP
            </a>
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            variants={item}
            className="text-[#2e4e63] text-xs max-w-sm leading-relaxed"
          >
            Independent app. Not affiliated with or endorsed by the State of
            Michigan or Michigan DNR.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="relative z-10 flex justify-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        aria-hidden="true"
      >
        <motion.a
          href="#problem"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#1e3a5f] hover:text-[#3d6070] transition-colors"
          aria-label="Scroll to next section"
        >
          <ChevronDown size={26} />
        </motion.a>
      </motion.div>

      {/* Bottom edge fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #050f1d)",
        }}
      />
    </section>
  );
}
