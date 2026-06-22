"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

/* ── Individual screen UIs ───────────────────────────────────────── */

function ExploreScreen() {
  return (
    <div className="flex flex-col h-full bg-[#071222] text-[#f0f9ff]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[#67e8f9] text-[7px] font-bold tracking-wider">PURE MI</span>
        <span className="text-[#1e3a5f] text-[7px]">⬡ Offline</span>
      </div>

      {/* Search */}
      <div className="mx-2.5 mb-2 bg-[#0d2040] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border border-[#1e3a5f]">
        <span className="text-[#1e3a5f] text-[8px]">⌕</span>
        <span className="text-[#1e3a5f] text-[7px]">Search waters, launches…</span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 px-2.5 mb-1.5 overflow-hidden">
        {["All", "Launches", "Hotspots"].map((chip, i) => (
          <span
            key={chip}
            className="text-[6px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={
              i === 0
                ? { background: "#00acc1", color: "#fff" }
                : { background: "#0d2040", color: "#1e3a5f" }
            }
          >
            {chip}
          </span>
        ))}
      </div>

      {/* Map area */}
      <div
        className="flex-1 relative mx-2.5 rounded-xl overflow-hidden"
        style={{
          background: "#071222",
          backgroundImage:
            "linear-gradient(rgba(0,172,193,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,172,193,0.05) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        {/* River path SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 10 15 Q 30 30 45 48 Q 62 66 85 82"
            stroke="rgba(0,172,193,0.25)"
            strokeWidth="9"
            fill="rgba(0,61,165,0.12)"
          />
        </svg>

        {/* Pins */}
        {[
          { x: "28%", y: "32%", color: "#00acc1" },
          { x: "50%", y: "50%", color: "#ff6b35" },
          { x: "68%", y: "28%", color: "#00acc1" },
          { x: "42%", y: "66%", color: "#00acc1" },
          { x: "75%", y: "62%", color: "#00acc1" },
        ].map((pin, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pin.x, top: pin.y }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full ring-1 ring-[#071222]"
              style={{ background: pin.color }}
            />
          </div>
        ))}

        {/* Coord label */}
        <div className="absolute bottom-1 right-1.5 text-[#0d2040] font-mono text-[5px]">
          42.33°N 83.04°W
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="bg-[#0a1628] rounded-t-xl mx-0 mt-1 px-2.5 py-2">
        <div className="w-5 h-0.5 bg-[#1e3a5f] rounded-full mx-auto mb-1.5" />
        <p className="text-[#67e8f9] text-[7px] font-bold mb-1.5">Nearby Right Now</p>
        {["Wyandotte Ramp", "Elizabeth Park"].map((name) => (
          <div key={name} className="flex items-center gap-1.5 py-1 border-b border-[#071222] last:border-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00acc1]" />
            <span className="text-[#3d6070] text-[7px]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaterbodyScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0a1628]">
      {/* Gradient hero */}
      <div
        className="px-2.5 pt-2.5 pb-3 flex flex-col justify-end"
        style={{ background: "linear-gradient(160deg, #003da5 0%, #00acc1 100%)", minHeight: 64 }}
      >
        <p className="text-white text-[9px] font-extrabold">Detroit River</p>
        <p className="text-[#a8e4f0] text-[7px]">42.33°N · 83.04°W · 32 river miles</p>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1.5">
        <span className="text-[#1e3a5f] text-[7px]">← Explore</span>
      </div>

      <div className="flex-1 overflow-hidden px-2.5 space-y-1.5">
        {/* Species row */}
        <div className="bg-[#071222] rounded-lg p-2">
          <p className="text-[#67e8f9] text-[7px] font-bold uppercase tracking-wide mb-1">
            Top Species
          </p>
          <div className="flex gap-1 flex-wrap">
            {["Walleye", "Smallmouth", "Muskie", "Perch"].map((s) => (
              <span key={s} className="text-[#3d6070] text-[6px] bg-[#0d2040] px-1.5 py-0.5 rounded-full border border-[#1e3a5f]">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Walleye rules */}
        <div className="bg-[#071222] rounded-lg p-2">
          <p className="text-[#67e8f9] text-[7px] font-bold uppercase tracking-wide mb-1">
            Walleye — 2025–26
          </p>
          <div className="flex gap-2">
            <div>
              <p className="text-[#3d6070] text-[6px]">Min size</p>
              <p className="text-[#94b4c8] text-[8px] font-bold">15 in</p>
            </div>
            <div>
              <p className="text-[#3d6070] text-[6px]">Daily bag</p>
              <p className="text-[#94b4c8] text-[8px] font-bold">5 fish</p>
            </div>
            <div>
              <p className="text-[#3d6070] text-[6px]">Season</p>
              <p className="text-[#94b4c8] text-[8px] font-bold">Mar–Nov</p>
            </div>
          </div>
        </div>

        {/* Launches */}
        <div className="bg-[#071222] rounded-lg p-2">
          <p className="text-[#67e8f9] text-[7px] font-bold uppercase tracking-wide mb-1">
            6 Launches Nearby
          </p>
          <p className="text-[#2e5268] text-[7px]">Wyandotte · Belle Isle · +4 more</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-2.5">
        <div className="bg-[#ff6b35] rounded-xl py-2 text-center">
          <span className="text-white text-[8px] font-bold">Start Trip →</span>
        </div>
      </div>
    </div>
  );
}

function TripModeScreen() {
  return (
    <div className="flex flex-col h-full bg-[#040d1a]">
      {/* Header */}
      <div className="px-2.5 pt-2.5 flex items-center justify-between">
        <div>
          <p className="text-[#67e8f9] text-[8px] font-bold tracking-wider">TRIP ACTIVE</p>
          <p className="text-[#1e3a5f] text-[7px]">Detroit River · 2h 14m</p>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,107,53,0.15)" }}>
          <span className="text-[8px]">⏱</span>
        </div>
      </div>

      {/* Action grid */}
      <div className="flex-1 grid grid-cols-2 gap-1.5 p-2 pt-2.5">
        {[
          { label: "Rules", icon: "📋", color: "#1565c0" },
          { label: "Launches", icon: "⚓", color: "#065f46" },
          { label: "Conditions", icon: "🌡️", color: "#7c3aed" },
          { label: "Log Catch", icon: "🎣", color: "#ff6b35" },
          { label: "Compass", icon: "🧭", color: "#0891b2" },
          { label: "Emergency", icon: "🆘", color: "#9f1239" },
        ].map((btn) => (
          <div
            key={btn.label}
            className="rounded-xl flex flex-col items-center justify-center py-2.5 gap-1.5"
            style={{
              background: `${btn.color}18`,
              border: `1px solid ${btn.color}38`,
            }}
          >
            <span className="text-sm leading-none">{btn.icon}</span>
            <span className="text-[7px] font-bold" style={{ color: btn.color === "#ff6b35" ? "#ff8c42" : "#5a8099" }}>
              {btn.label}
            </span>
          </div>
        ))}
      </div>

      {/* End trip */}
      <div className="p-2">
        <div className="border border-[#9f1239]/40 rounded-xl py-1.5 text-center">
          <span className="text-[#9f1239]/70 text-[7px] font-bold">End Trip</span>
        </div>
      </div>
    </div>
  );
}

function ConditionsScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0a1628]">
      <div className="px-2.5 pt-2.5 pb-1">
        <p className="text-[#f0f9ff] text-[9px] font-bold">Conditions</p>
        <p className="text-[#1e3a5f] text-[7px]">Detroit River · Last sync 6h ago</p>
      </div>

      {/* Weather hero */}
      <div
        className="mx-2.5 mb-2 rounded-xl p-3 text-center"
        style={{ background: "linear-gradient(135deg, rgba(21,101,192,0.4) 0%, rgba(0,61,165,0.3) 100%)", border: "1px solid rgba(59,130,246,0.2)" }}
      >
        <div className="text-2xl mb-0.5">⛅</div>
        <p className="text-[#f0f9ff] text-sm font-bold">68°F</p>
        <p className="text-[#3d6070] text-[7px]">Partly Cloudy · WSW 12 mph</p>
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(6,95,70,0.4)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <span className="text-[#34d399] text-[7px] font-bold">● GOOD FISHING</span>
        </div>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 gap-1.5 mx-2.5">
        {[
          { label: "Water Temp", value: "74.8°F", icon: "🌡️" },
          { label: "River Level", value: "8.2 ft", icon: "💧" },
          { label: "Clarity", value: "Clear", icon: "👁️" },
          { label: "Ice Status", value: "None", icon: "🧊" },
        ].map((d) => (
          <div key={d.label} className="bg-[#071222] rounded-lg p-2 border border-[#0d2040]">
            <p className="text-[#1e3a5f] text-[6px] uppercase tracking-wide mb-0.5">{d.icon} {d.label}</p>
            <p className="text-[#94b4c8] text-[8px] font-bold">{d.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogbookScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0a1628]">
      <div className="px-2.5 pt-2.5 pb-1.5 flex items-center justify-between">
        <p className="text-[#f0f9ff] text-[9px] font-bold">Catch Logbook</p>
        <div className="w-5 h-5 rounded-full bg-[#ff6b35] flex items-center justify-center shadow-lg">
          <span className="text-white text-[9px] font-bold leading-none">+</span>
        </div>
      </div>

      {/* Catch entries */}
      <div className="flex-1 overflow-hidden px-2.5 space-y-1.5">
        {[
          { species: "Walleye", size: '18.5"', weight: "3.2 lbs", date: "Jun 12", color: "#00acc1" },
          { species: "Smallmouth", size: '14"', weight: "1.8 lbs", date: "Jun 10", color: "#10b981" },
          { species: "Yellow Perch", size: '9.5"', weight: "0.6 lbs", date: "Jun 8", color: "#f59e0b" },
        ].map((c) => (
          <div key={c.date} className="bg-[#071222] rounded-lg p-2 flex items-center gap-2 border border-[#0d2040]">
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: c.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-[#94b4c8] text-[8px] font-bold">{c.species}</p>
              <p className="text-[#1e3a5f] text-[7px]">{c.size} · {c.weight}</p>
            </div>
            <p className="text-[#1e3a5f] text-[6px] flex-shrink-0 font-mono">{c.date}</p>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mx-2.5 mb-2 mt-2 bg-[#071222] rounded-xl p-2.5 flex items-center justify-around border border-[#0d2040]">
        {[
          { val: "3", lbl: "Catches" },
          { val: '18.5"', lbl: "Best" },
          { val: "3", lbl: "Species" },
        ].map((s) => (
          <div key={s.lbl} className="text-center">
            <p className="text-[#67e8f9] text-[9px] font-bold">{s.val}</p>
            <p className="text-[#1e3a5f] text-[6px]">{s.lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Phone frame wrapper ─────────────────────────────────────────── */

function PhoneFrame({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="relative flex-shrink-0 rounded-[32px] overflow-hidden shadow-2xl"
      style={{
        width: 168,
        height: 340,
        background: "#0a1628",
        border: `2px solid ${accentColor}40`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}20`,
      }}
    >
      {/* Dynamic island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#050f1d] rounded-full z-20" />

      {/* Screen glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-[30px]"
        style={{
          background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 55%)`,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 pt-8 overflow-hidden">{children}</div>
    </div>
  );
}

/* ── Main section ────────────────────────────────────────────────── */

const SCREENS = [
  { id: "explore",    label: "Explore Map",      accent: "#00acc1", Component: ExploreScreen },
  { id: "waterbody",  label: "Waterbody Detail", accent: "#1565c0", Component: WaterbodyScreen },
  { id: "trip",       label: "Trip Mode",        accent: "#ff6b35", Component: TripModeScreen },
  { id: "conditions", label: "Conditions",       accent: "#8b5cf6", Component: ConditionsScreen },
  { id: "logbook",    label: "Logbook",          accent: "#f59e0b", Component: LogbookScreen },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AppPreviewSection() {
  const [active, setActive] = useState<string>("explore");

  return (
    <section
      id="screens"
      aria-labelledby="screens-heading"
      className="py-24 bg-[#f5f3ef] px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col items-center gap-12"
        >
          {/* Header */}
          <div className="text-center max-w-2xl">
            <motion.p
              variants={fadeUp}
              className="text-[#ff6b35] text-xs font-bold uppercase tracking-widest mb-3"
            >
              App Preview
            </motion.p>
            <motion.h2
              id="screens-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#071222] leading-tight"
            >
              5 screens. Every angler need covered.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#4a6275] text-base mt-4 leading-relaxed"
            >
              These CSS mockups preview the app&apos;s dark-navy field UI — built
              for readability in low light, cold conditions, and gloved hands.
            </motion.p>
          </div>

          {/* Tab selector */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="App screens"
          >
            {SCREENS.map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={active === s.id}
                onClick={() => setActive(s.id)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
                style={
                  active === s.id
                    ? {
                        background: s.accent,
                        color: "#fff",
                        boxShadow: `0 4px 20px ${s.accent}40`,
                      }
                    : {
                        background: "#e8e4dc",
                        color: "#4a6275",
                      }
                }
              >
                {s.label}
              </button>
            ))}
          </motion.div>

          {/* Phone frames row */}
          <motion.div
            variants={fadeUp}
            className="flex gap-5 overflow-x-auto pb-4 px-2 justify-start lg:justify-center w-full"
            style={{ scrollbarWidth: "none" }}
          >
            {SCREENS.map((s) => {
              const isActive = s.id === active;
              return (
                <motion.div
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  animate={{
                    scale: isActive ? 1.06 : 0.93,
                    opacity: isActive ? 1 : 0.55,
                    y: isActive ? -8 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="cursor-pointer flex-shrink-0"
                  role="button"
                  aria-label={`Preview ${s.label}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActive(s.id)}
                >
                  <PhoneFrame accentColor={s.accent}>
                    <s.Component />
                  </PhoneFrame>
                  <p
                    className="text-center text-xs font-semibold mt-3 transition-colors"
                    style={{ color: isActive ? "#071222" : "#94a3b8" }}
                  >
                    {s.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Active screen description */}
          <motion.div
            variants={fadeUp}
            className="text-center max-w-md"
          >
            {SCREENS.map(
              (s) =>
                s.id === active && (
                  <p key={s.id} className="text-[#4a6275] text-sm leading-relaxed">
                    {s.id === "explore" &&
                      "Dark map view with offline tiles, launch pins, hotspot markers, and a pull-up bottom sheet. Filter by launch type, distance, or species."}
                    {s.id === "waterbody" &&
                      "Gradient hero with waterbody name and coordinates. Shows species, regulation summaries, nearby launches, and current conditions."}
                    {s.id === "trip" &&
                      "Full-screen field UI with large tap targets. Access rules, launches, conditions, compass, and emergency contacts — designed for gloved hands."}
                    {s.id === "conditions" &&
                      "Cached weather snapshot with fishing rating badge. Water temperature, river level, clarity, and ice status — last synced from the dock."}
                    {s.id === "logbook" &&
                      "Private, on-device catch log. Record species, size, weight, method, and notes. Your data never leaves your phone."}
                  </p>
                )
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
