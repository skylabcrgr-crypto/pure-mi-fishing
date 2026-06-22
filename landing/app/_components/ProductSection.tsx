"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Map,
  MapPin,
  BookOpen,
  Fish,
  Wind,
  Snowflake,
  BookMarked,
  ShoppingBag,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Map,
    gradient: "from-[#0e7490] to-[#00acc1]",
    glow: "rgba(0,172,193,0.18)",
    tag: "Offline Ready",
    title: "Offline Detroit River Map Pack",
    body: "Download 48 MB covering zoom 10–16. Map tiles, launch pins, hotspots, and shore access — stored locally for zero-signal days.",
  },
  {
    Icon: MapPin,
    gradient: "from-[#065f46] to-[#10b981]",
    glow: "rgba(16,185,129,0.18)",
    tag: "6 Launches",
    title: "Boat Launch & Shore Access Finder",
    body: "6 mapped launch sites from Belle Isle to Lake Erie. Coordinates, hours, fees, amenities, and Apple Maps deep-link — all offline.",
  },
  {
    Icon: BookOpen,
    gradient: "from-[#1e3a8a] to-[#3b82f6]",
    glow: "rgba(59,130,246,0.18)",
    tag: "Plain Language",
    title: "Simplified Regulation Summaries",
    body: "Plain-language summaries of 2025–26 Michigan DNR rules for top species. Size limits, bag limits, and seasonal windows at a glance.",
  },
  {
    Icon: Fish,
    gradient: "from-[#0c4a6e] to-[#0ea5e9]",
    glow: "rgba(14,165,233,0.18)",
    tag: "7 Species",
    title: "Species Planning by Season",
    body: "Walleye, smallmouth bass, muskie, steelhead, perch, pike, and more. Peak windows, target zones, and regulation flags per species.",
  },
  {
    Icon: Wind,
    gradient: "from-[#4c1d95] to-[#8b5cf6]",
    glow: "rgba(139,92,246,0.18)",
    tag: "Cached Data",
    title: "Water & Weather Conditions Snapshot",
    body: "Cached weather, water temperature, river levels, flow rate, and clarity — last synced before you left the dock, with stale-data warnings.",
  },
  {
    Icon: Snowflake,
    gradient: "from-[#0e4f6b] to-[#67e8f9]",
    glow: "rgba(103,232,249,0.18)",
    tag: "Year-Round",
    title: "Ice Mode & Spearfishing Info",
    body: "Safe ice thickness guides, ice fishing regulation notes, and spearfishing rules for the Detroit River region. Built for every season.",
  },
  {
    Icon: BookMarked,
    gradient: "from-[#78350f] to-[#f59e0b]",
    glow: "rgba(245,158,11,0.18)",
    tag: "Private & Local",
    title: "On-Device Catch Log",
    body: "Record species, size, weight, method, bait, and location notes. Private, on-device only — your data never leaves your phone.",
  },
  {
    Icon: ShoppingBag,
    gradient: "from-[#881337] to-[#f43f5e]",
    glow: "rgba(244,63,94,0.18)",
    tag: "Official Source",
    title: "Official License Handoff",
    body: "One tap to the official Michigan DNR license portal. No payment is ever handled inside the app — we send you to the authoritative source.",
  },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function ProductSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 bg-[#071222] px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col items-center gap-14"
        >
          {/* Header */}
          <div className="text-center max-w-2xl">
            <motion.p
              variants={fadeUp}
              className="text-[#00acc1] text-xs font-bold uppercase tracking-widest mb-3"
            >
              Features
            </motion.p>
            <motion.h2
              id="features-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#f0f9ff] leading-tight"
            >
              Everything you need before you cast.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#3d6070] text-base mt-4 leading-relaxed"
            >
              Pure MI Fishing puts field-critical information in your hands —
              even without LTE, 5G, or any signal at all.
            </motion.p>
          </div>

          {/* Feature grid */}
          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
          >
            {FEATURES.map((f) => (
              <motion.article
                key={f.title}
                variants={fadeUp}
                className="group relative bg-[#0a1628] rounded-2xl p-5 border border-[#0d2040] hover:border-[#1a3358] transition-all hover:-translate-y-1 cursor-default"
                whileHover={{ boxShadow: `0 12px 48px ${f.glow}` }}
              >
                {/* Gradient icon */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 shadow-lg`}
                >
                  <f.Icon size={17} className="text-white" strokeWidth={2} />
                </div>

                {/* Tag chip */}
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#3d7a8a] bg-[#071222] border border-[#0d2040] px-2.5 py-0.5 rounded-full mb-3">
                  {f.tag}
                </span>

                <h3 className="font-bold text-[#c8e0ef] text-sm mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-[#2e5268] text-xs leading-relaxed">{f.body}</p>

                {/* Subtle corner glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${f.glow} 0%, transparent 60%)`,
                  }}
                />
              </motion.article>
            ))}
          </motion.div>

          {/* Bottom note */}
          <motion.p
            variants={fadeUp}
            className="text-[#1e3a5f] text-xs text-center max-w-lg leading-relaxed"
          >
            Regulation summaries are planning aids only. Always verify current
            rules at{" "}
            <a
              href="https://www.michigan.gov/dnr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2e5268] hover:text-[#3d6070] underline transition-colors"
            >
              michigan.gov/dnr
            </a>{" "}
            before fishing.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
