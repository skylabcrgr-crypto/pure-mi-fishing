"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ShoppingBag, ExternalLink, Shield, CheckCircle2 } from "lucide-react";

const DNR_LICENSE_URL =
  "https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses";

const LICENSE_TYPES = [
  { label: "Resident Annual", price: "$26", note: "Michigan residents 17+" },
  { label: "Non-Resident Annual", price: "$76", note: "Non-residents 17+" },
  { label: "24-Hour All-Species", price: "$9", note: "All anglers" },
  { label: "Senior Resident", price: "$11", note: "MI residents 65+" },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export default function LicenseSection() {
  return (
    <section
      id="license"
      aria-labelledby="license-heading"
      className="py-24 bg-[#f5f3ef] px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col items-center gap-12"
        >
          {/* Header */}
          <div className="text-center max-w-2xl">
            <motion.div variants={fadeUp} className="flex items-center justify-center mb-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(0,61,165,0.08)",
                  border: "1px solid rgba(0,61,165,0.18)",
                  color: "#003da5",
                }}
              >
                <Shield size={11} strokeWidth={2.5} />
                Official Michigan DNR
              </div>
            </motion.div>
            <motion.h2
              id="license-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#071222] leading-tight mb-4"
            >
              Buy your Michigan fishing license through the official source.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#4a6275] text-base leading-relaxed"
            >
              Pure MI Fishing keeps license purchase simple by directing you to
              the official Michigan DNR license portal. We never handle payment,
              store license data, or require an account.
            </motion.p>
          </div>

          {/* License price grid */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
          >
            {LICENSE_TYPES.map((lt) => (
              <motion.div
                key={lt.label}
                variants={fadeUp}
                className="bg-white rounded-2xl p-5 border border-[#e6e1d8] text-center shadow-sm"
              >
                <p className="text-[#003da5] text-2xl font-extrabold mb-1">{lt.price}</p>
                <p className="text-[#071222] text-xs font-semibold mb-1">{lt.label}</p>
                <p className="text-[#94a3b8] text-[11px]">{lt.note}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Info points */}
          <motion.div
            variants={stagger}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl"
          >
            {[
              "Prices shown are approximate 2025–26 estimates. Verify at michigan.gov/dnr.",
              "Additional stamps may be required for trout, salmon, and Great Lakes fishing.",
            ].map((note) => (
              <motion.div
                key={note}
                variants={fadeUp}
                className="flex gap-3 bg-white rounded-xl p-4 border border-[#e6e1d8] flex-1"
              >
                <CheckCircle2 size={16} className="text-[#003da5] flex-shrink-0 mt-0.5" />
                <p className="text-[#4a6275] text-xs leading-relaxed">{note}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
            <a
              href={DNR_LICENSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#003da5] hover:bg-[#1565c0] text-white font-bold text-base px-10 py-4 rounded-xl transition-all shadow-xl shadow-[#003da5]/25 hover:shadow-[#1565c0]/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003da5] focus-visible:ring-offset-2"
            >
              <ShoppingBag size={18} />
              Purchase on Michigan DNR
              <ExternalLink size={14} className="opacity-70" />
            </a>
            <p className="text-[#94a3b8] text-xs text-center max-w-xs">
              Opens michigan.gov/dnr — the official state licensing portal.
              Pure MI Fishing has no affiliation with the State of Michigan.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
