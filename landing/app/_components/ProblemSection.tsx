"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { BookOpen, MapPin, Cloud, WifiOff, ShoppingBag } from "lucide-react";

const PROBLEMS = [
  {
    Icon: BookOpen,
    iconColor: "#3b82f6",
    iconBg: "rgba(59,130,246,0.1)",
    title: "Regulations are hard to interpret on the water.",
    body: "Michigan DNR documents cover hundreds of species, zones, and special rules. Interpreting them mid-trip — cold, in gloves, on a small screen — is unnecessarily hard.",
  },
  {
    Icon: MapPin,
    iconColor: "#00acc1",
    iconBg: "rgba(0,172,193,0.1)",
    title: "River access and launches are spread across multiple sources.",
    body: "Boat ramps, shore access points, and parking details live on county sites, Google Maps, and fishing forums — rarely in one searchable place.",
  },
  {
    Icon: Cloud,
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.1)",
    title: "Conditions change fast and vary by location.",
    body: "Ice-out windows, water temperature, clarity, and flow affect where fish hold and which rules apply. Anglers want a single field summary, not five browser tabs.",
  },
  {
    Icon: WifiOff,
    iconColor: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.1)",
    title: "Cell service is unreliable near water.",
    body: "The Detroit River's best access points and tributary banks drop signal regularly. Anglers get cut off from everything except pre-loaded, offline-ready content.",
  },
  {
    Icon: ShoppingBag,
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.1)",
    title: "Current apps focus on transactions, not field intelligence.",
    body: "Most fishing apps are built to sell licenses, gear, or subscriptions. Practical field info — launches, regs, maps, conditions — is buried or missing entirely.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export default function ProblemSection() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="py-24 bg-[#f5f3ef] px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
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
              className="text-[#ff6b35] text-xs font-bold uppercase tracking-widest mb-3"
            >
              The Problem
            </motion.p>
            <motion.h2
              id="problem-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#071222] leading-tight"
            >
              Michigan fishing info is scattered when anglers need it most.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#4a6275] text-base mt-4 leading-relaxed"
            >
              From regulations to ramp locations, the information Michigan
              anglers rely on is split across government PDFs, county parks
              sites, and outdated forums — rarely offline-ready.
            </motion.p>
          </div>

          {/* Cards grid */}
          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full"
          >
            {PROBLEMS.map((p) => (
              <motion.article
                key={p.title}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-[#e6e1d8] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: p.iconBg }}
                >
                  <p.Icon size={18} style={{ color: p.iconColor }} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[#071222] text-base mb-2 leading-snug">
                  {p.title}
                </h3>
                <p className="text-[#4a6275] text-sm leading-relaxed">{p.body}</p>
              </motion.article>
            ))}

            {/* Wide accent card */}
            <motion.div
              variants={fadeUp}
              className="sm:col-span-2 lg:col-span-1 bg-[#071222] rounded-2xl p-6 border border-[#0d2040] flex flex-col justify-between"
            >
              <div>
                <p className="text-[#00acc1] text-xs font-bold uppercase tracking-widest mb-3">
                  The solution
                </p>
                <h3 className="font-bold text-[#f0f9ff] text-lg mb-3 leading-snug">
                  One offline-first app, built specifically for Michigan waters.
                </h3>
                <p className="text-[#3d6070] text-sm leading-relaxed">
                  Pure MI Fishing brings together maps, regulations, launch
                  sites, and conditions — pre-loaded on your device before you
                  leave the dock.
                </p>
              </div>
              <a
                href="#features"
                className="mt-6 inline-flex items-center gap-2 text-[#67e8f9] text-sm font-semibold hover:text-[#22d3ee] transition-colors"
              >
                See all features →
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
