"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Download, WifiOff, Clock, MapPin, Fish, AlertTriangle } from "lucide-react";

const OFFLINE_FEATURES = [
  {
    Icon: Download,
    color: "#67e8f9",
    label: "Saved Map Packs",
    body: "Download full tile sets before you leave. Detroit River pack covers zoom 10–16, all 6 launches, and hotspot pins — 48 MB total.",
  },
  {
    Icon: Clock,
    color: "#a78bfa",
    label: "Last-Synced Regulation Summaries",
    body: "Species rules are cached on download. Stale-data warnings appear when regulations may have changed. Always link to the authoritative source.",
  },
  {
    Icon: MapPin,
    color: "#34d399",
    label: "Launch Site Details",
    body: "Coordinates, ramp type, parking, hours, and fees — all stored offline. Navigate directly to any launch from inside the app.",
  },
  {
    Icon: Fish,
    color: "#fbbf24",
    label: "Saved Trips & Catch Log",
    body: "Trip history and catch entries are stored exclusively on-device using AsyncStorage. No sync, no upload, no account required.",
  },
  {
    Icon: WifiOff,
    color: "#f87171",
    label: "Works Without Signal",
    body: "The full app functions after your download is complete. Map tiles, regulations, launches, and catch log all work at zero bars.",
  },
  {
    Icon: AlertTriangle,
    color: "#fb923c",
    label: "Stale-Data Warnings",
    body: "Clearly labeled timestamps on all cached content. You always know when data was last synced and when it may be outdated.",
  },
] as const;

const PACKS = [
  { name: "Detroit River Pack", size: "48 MB", coverage: "Zoom 10–16 · 6 launches · 7 species" },
  { name: "Belle Isle Pack", size: "18 MB", coverage: "Island perimeter · Shore access · Carry-in" },
  { name: "Lake St. Clair Edge", size: "76 MB", coverage: "Quad cities · 4 access points · Perch zones" },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function OfflineSection() {
  return (
    <section
      id="offline"
      aria-labelledby="offline-heading"
      className="py-24 bg-[#071222] px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(103,232,249,0.07) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(0,61,165,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col gap-16"
        >
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              variants={fadeUp}
              className="text-[#67e8f9] text-xs font-bold uppercase tracking-widest mb-3"
            >
              Offline First
            </motion.p>
            <motion.h2
              id="offline-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#f0f9ff] leading-tight mb-5"
            >
              Built for boat ramps, riverbanks,{" "}
              <span className="text-gradient-teal">
                cold mornings, and weak signal.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#3d6070] text-base leading-relaxed"
            >
              The Detroit River&apos;s best fishing spots regularly drop LTE signal.
              Pure MI Fishing is architected to work completely offline after
              a single download — no data plan needed on the water.
            </motion.p>
          </div>

          {/* Feature list — glassmorphism card */}
          <motion.div
            variants={fadeUp}
            className="glass rounded-3xl p-6 sm:p-10"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {OFFLINE_FEATURES.map((f) => (
                <div key={f.label} className="flex gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${f.color}14`, border: `1px solid ${f.color}25` }}
                  >
                    <f.Icon size={16} style={{ color: f.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[#c8e0ef] text-sm font-bold mb-1">{f.label}</p>
                    <p className="text-[#2e5268] text-xs leading-relaxed">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Available packs */}
          <motion.div variants={stagger} className="flex flex-col gap-5">
            <motion.h3
              variants={fadeUp}
              className="text-[#f0f9ff] text-xl font-bold text-center"
            >
              Available Offline Packs
            </motion.h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {PACKS.map((pack, i) => (
                <motion.div
                  key={pack.name}
                  variants={fadeUp}
                  className="glass rounded-2xl p-5 flex flex-col gap-3"
                >
                  {/* Pack icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#0d2040] flex items-center justify-center">
                      <Download size={16} className="text-[#67e8f9]" strokeWidth={2} />
                    </div>
                    <span className="text-[#f59e0b] text-xs font-bold font-mono">
                      {pack.size}
                    </span>
                  </div>

                  <div>
                    <p className="text-[#c8e0ef] text-sm font-bold mb-1">{pack.name}</p>
                    <p className="text-[#2e5268] text-xs leading-relaxed">{pack.coverage}</p>
                  </div>

                  {/* Progress bar (static preview) */}
                  <div className="h-1 bg-[#0d2040] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: i === 0 ? "100%" : "0%",
                        background:
                          i === 0
                            ? "linear-gradient(90deg, #00acc1, #67e8f9)"
                            : "transparent",
                      }}
                    />
                  </div>
                  <p className="text-[#1e3a5f] text-[10px]">
                    {i === 0 ? "✓ Downloaded" : "Available in app"}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
