"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fish, Menu, X, ExternalLink } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Detroit River", href: "#detroit" },
  { label: "Offline", href: "#offline" },
  { label: "License", href: "#license" },
  { label: "Trust", href: "#trust" },
];

const DNR_LICENSE_URL =
  "https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#050f1d]/92 backdrop-blur-xl border-b border-[#0d2040]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group" aria-label="Pure MI Fishing home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00acc1] to-[#003da5] flex items-center justify-center shadow-lg shadow-[#00acc1]/20">
              <Fish size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[#f0f9ff] font-bold text-[15px] tracking-tight">
              Pure MI Fishing
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[#7a9eb8] hover:text-[#f0f9ff] text-sm font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href={DNR_LICENSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#67e8f9] hover:text-[#22d3ee] text-sm font-medium transition-colors"
            >
              MI License <ExternalLink size={11} />
            </a>
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#cta"
              className="hidden sm:inline-flex items-center bg-[#ff6b35] hover:bg-[#ff7d42] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-[#ff6b35]/20"
            >
              Join Early Access
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-[#7a9eb8] hover:text-[#f0f9ff] transition-colors rounded-lg hover:bg-white/5"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#050f1d]/96 backdrop-blur-xl border-b border-[#0d2040] px-4 py-4 md:hidden"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-[#7a9eb8] hover:text-[#f0f9ff] text-base font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={DNR_LICENSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-[#67e8f9] text-base font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
              >
                MI Fishing License <ExternalLink size={14} />
              </a>
              <a
                href="#cta"
                onClick={() => setOpen(false)}
                className="mt-2 text-center bg-[#ff6b35] hover:bg-[#ff7d42] text-white font-bold py-3 rounded-lg transition-colors"
              >
                Join Early Access
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
