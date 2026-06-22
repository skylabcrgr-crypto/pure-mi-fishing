"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Shield,
  ExternalLink,
  Accessibility,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const TRUST_ITEMS = [
  {
    Icon: Shield,
    color: "#003da5",
    bg: "rgba(0,61,165,0.08)",
    border: "rgba(0,61,165,0.15)",
    title: "Independent App",
    body: "Pure MI Fishing is not affiliated with, endorsed by, or sponsored by the State of Michigan, Michigan DNR, or the Pure Michigan tourism campaign.",
  },
  {
    Icon: ExternalLink,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.08)",
    border: "rgba(8,145,178,0.15)",
    title: "Official Source Links",
    body: "All regulation summaries link directly to michigan.gov/dnr for verification. License purchases go to the official DNR portal. No in-app purchases.",
  },
  {
    Icon: Accessibility,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.15)",
    title: "Accessibility-Minded Design",
    body: "High-contrast color ratios, large touch targets (minimum 44×44pt), semantic HTML headings, and keyboard-navigable UI throughout.",
  },
  {
    Icon: Lock,
    color: "#065f46",
    bg: "rgba(6,95,70,0.08)",
    border: "rgba(6,95,70,0.15)",
    title: "Privacy-First Catch Log",
    body: "All catch data is stored exclusively on your device using local-only storage. No account is required. No data is transmitted. Your log is yours alone.",
  },
  {
    Icon: Eye,
    color: "#b45309",
    bg: "rgba(180,83,9,0.08)",
    border: "rgba(180,83,9,0.15)",
    title: "No Sale of Personal Data",
    body: "Pure MI Fishing does not collect, sell, share, or monetize personal fishing data. There is no analytics tracking beyond anonymous crash reporting.",
  },
  {
    Icon: AlertTriangle,
    color: "#ff6b35",
    bg: "rgba(255,107,53,0.08)",
    border: "rgba(255,107,53,0.15)",
    title: "Clear Stale-Data Warnings",
    body: "Every cached regulation, conditions snapshot, and offline pack shows a last-synced timestamp. You always know how current your data is.",
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

export default function TrustSection() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="py-24 bg-[#071222] px-4 sm:px-6"
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
              className="text-[#00acc1] text-xs font-bold uppercase tracking-widest mb-3"
            >
              Trust &amp; Compliance
            </motion.p>
            <motion.h2
              id="trust-heading"
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold text-[#f0f9ff] leading-tight"
            >
              Built to be honest, private, and accessible.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#3d6070] text-base mt-4 leading-relaxed"
            >
              Pure MI Fishing is a tool to help anglers, not a platform to
              monetize their data. Here&apos;s what that means in practice.
            </motion.p>
          </div>

          {/* Trust cards grid */}
          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full"
          >
            {TRUST_ITEMS.map((t) => (
              <motion.article
                key={t.title}
                variants={fadeUp}
                className="bg-[#0a1628] rounded-2xl p-6 border border-[#0d2040] hover:border-[#1a3358] transition-all hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: t.bg, border: `1px solid ${t.border}` }}
                >
                  <t.Icon size={18} style={{ color: t.color }} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[#c8e0ef] text-base mb-2 leading-snug">
                  {t.title}
                </h3>
                <p className="text-[#2e5268] text-sm leading-relaxed">{t.body}</p>
              </motion.article>
            ))}
          </motion.div>

          {/* Disclaimer panel */}
          <motion.div
            variants={fadeUp}
            className="w-full glass rounded-2xl p-6 border-l-2 border-l-[#ff6b35]"
          >
            <div className="flex items-start gap-4">
              <CheckCircle2 size={20} className="text-[#ff6b35] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#c8e0ef] text-sm font-bold mb-2">
                  Official Disclaimer
                </p>
                <p className="text-[#2e5268] text-sm leading-relaxed">
                  Pure MI Fishing is an independent mobile application. All
                  regulation summaries are provided as simplified planning aids
                  only and may not reflect the most current Michigan DNR rules.
                  Always verify fishing regulations at{" "}
                  <a
                    href="https://www.michigan.gov/dnr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3d7a8a] hover:text-[#67e8f9] underline transition-colors inline-flex items-center gap-1"
                  >
                    michigan.gov/dnr <ExternalLink size={11} />
                  </a>{" "}
                  before fishing. This app is not affiliated with, endorsed by,
                  or sponsored by the State of Michigan, the Michigan Department
                  of Natural Resources, or the Pure Michigan tourism initiative.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
