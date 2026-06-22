"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Anchor, Navigation2, Fish } from "lucide-react";

const STATS = [
  { label: "Mapped Launches", value: "6" },
  { label: "Species Covered", value: "7+" },
  { label: "River Miles", value: "~32" },
  { label: "Offline Pack Size", value: "48 MB" },
];

const REGIONS = [
  {
    emoji: "🏝️",
    name: "Belle Isle",
    coords: "42.3414° N, 82.9737° W",
    access: "Carry-in only",
    highlight: "Walleye · Bass",
    desc: "Island park fishing access with shore casting and carry-in kayak/canoe. Strong walleye runs in spring along the main channel edge.",
    accentColor: "#00acc1",
  },
  {
    emoji: "🌆",
    name: "Detroit Shoreline",
    coords: "42.3314° N, 83.0457° W",
    access: "Shore & dock",
    highlight: "Perch · Smallmouth",
    desc: "Multiple shore access points along the waterfront. Dock fishing for yellow perch and smallmouth bass near current seams.",
    accentColor: "#3b82f6",
  },
  {
    emoji: "⚓",
    name: "Wyandotte Ramp",
    coords: "42.2098° N, 83.1513° W",
    access: "Multi-lane ramp",
    highlight: "Walleye · Muskie",
    desc: "Public multi-lane ramp with ample parking. Prime access to the lower Trenton Channel and Detroit River main stem.",
    accentColor: "#10b981",
  },
  {
    emoji: "⛵",
    name: "Elizabeth Park Marina",
    coords: "42.1245° N, 83.1459° W",
    access: "Marina ramp",
    highlight: "Bass · Perch",
    desc: "Protected Trenton Channel access. Shielded from main river current — excellent for anglers new to river fishing.",
    accentColor: "#8b5cf6",
  },
  {
    emoji: "🌊",
    name: "Trenton Channel",
    coords: "42.1400° N, 83.1800° W",
    access: "Multiple points",
    highlight: "Smallmouth · Walleye",
    desc: "Quieter corridor between Grosse Ile and the mainland. Known for exceptional smallmouth bass and walleye structure fishing.",
    accentColor: "#0ea5e9",
  },
  {
    emoji: "🦅",
    name: "Lake Erie Access",
    coords: "41.9800° N, 83.2200° W",
    access: "Metropark ramp",
    highlight: "Walleye · Perch",
    desc: "Lake Erie Metropark launch — gateway to western Lake Erie basin. Considered one of the top walleye fisheries in North America.",
    accentColor: "#f59e0b",
  },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function DetroitSection() {
  return (
    <section
      id="detroit"
      aria-labelledby="detroit-heading"
      className="py-24 bg-[#050f1d] px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Background dot pattern */}
      <div className="absolute inset-0 map-dot-pattern" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, #050f1d 85%)",
        }}
      />

      {/* Michigan blue glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,61,165,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col gap-14"
        >
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              variants={fadeUp}
              className="text-[#00acc1] text-xs font-bold uppercase tracking-widest mb-3"
            >
              Detroit River MVP
            </motion.p>
            <motion.h2
              id="detroit-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#f0f9ff] leading-tight mb-5"
            >
              Starting with the Detroit River.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#3d6070] text-base leading-relaxed"
            >
              We&apos;re beginning with one of Michigan&apos;s most important
              fishing corridors — from Belle Isle and the Detroit shoreline
              south through Wyandotte, Elizabeth Park, Trenton Channel, and
              into Lake Erie access points. This corridor holds walleye,
              smallmouth bass, muskie, yellow perch, steelhead, and northern
              pike across multiple seasons.
            </motion.p>
          </div>

          {/* Stats row */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="glass rounded-2xl p-5 text-center"
              >
                <div className="text-3xl font-extrabold text-gradient-teal mb-1">
                  {s.value}
                </div>
                <div className="text-[#2e5268] text-[11px] font-semibold uppercase tracking-wider">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Region cards grid */}
          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {REGIONS.map((r) => (
              <motion.article
                key={r.name}
                variants={fadeUp}
                className="glass rounded-2xl p-5 hover:bg-white/[0.06] transition-all group"
              >
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl leading-none mt-0.5">{r.emoji}</span>
                  <div>
                    <h3 className="font-bold text-[#c8e0ef] text-base leading-snug">
                      {r.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Navigation2 size={9} style={{ color: r.accentColor }} />
                      <span className="text-[#1e3a5f] text-[10px] font-mono tracking-tight">
                        {r.coords}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[#2e5268] text-sm leading-relaxed mb-4">
                  {r.desc}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                    style={{
                      color: r.accentColor,
                      background: `${r.accentColor}12`,
                      borderColor: `${r.accentColor}30`,
                    }}
                  >
                    <Anchor size={8} />
                    {r.access}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7a9eb8] bg-[#071222] border border-[#0d2040] px-2.5 py-1 rounded-full">
                    <Fish size={8} />
                    {r.highlight}
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Expansion note */}
          <motion.div
            variants={fadeUp}
            className="text-center p-6 border border-dashed border-[#0d2040] rounded-2xl"
          >
            <p className="text-[#1e3a5f] text-sm">
              <span className="text-[#2e5268] font-semibold">
                Additional regions planned:
              </span>{" "}
              St. Clair River · Lake St. Clair · Pere Marquette · Muskegon
              River · Upper Peninsula waters
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
