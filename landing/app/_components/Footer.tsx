import { Fish, ExternalLink } from "lucide-react";

const DNR_REGS_URL =
  "https://www.michigan.gov/dnr/things-to-do/fishing/regulations";
const DNR_LICENSE_URL =
  "https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses";

const FOOTER_LINKS = [
  {
    heading: "App",
    links: [
      { label: "Early Access", href: "#cta" },
      { label: "Features", href: "#features" },
      { label: "Offline Maps", href: "#offline" },
      { label: "App Screens", href: "#screens" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Detroit River MVP", href: "#detroit" },
      { label: "Species Guide", href: "#features" },
      { label: "Boat Launches", href: "#detroit" },
      { label: "Conditions", href: "#features" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Disclaimer", href: "#trust" },
      { label: "Trust & Compliance", href: "#trust" },
    ],
  },
  {
    heading: "Official Sources",
    links: [
      { label: "MI DNR Fishing Regulations", href: DNR_REGS_URL, external: true },
      { label: "MI Fishing License Info", href: DNR_LICENSE_URL, external: true },
      { label: "michigan.gov/dnr", href: "https://www.michigan.gov/dnr", external: true },
    ],
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#030a14] border-t border-[#0d2040] px-4 sm:px-6 pt-16 pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Top: Logo + links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00acc1] to-[#003da5] flex items-center justify-center">
                <Fish size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[#f0f9ff] font-bold text-[15px]">
                Pure MI Fishing
              </span>
            </div>
            <p className="text-[#1e3a5f] text-xs leading-relaxed max-w-[180px]">
              Independent Michigan fishing field companion. Detroit River and
              beyond.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <p className="text-[#3d6070] text-[10px] font-bold uppercase tracking-widest">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1e3a5f] hover:text-[#3d6070] text-xs transition-colors"
                      >
                        {link.label}
                        <ExternalLink size={9} />
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-1 text-[#1e3a5f] hover:text-[#3d6070] text-xs transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Disclaimer */}
        <p className="text-[#0d2040] text-[11px] leading-relaxed text-center max-w-3xl mx-auto mb-4">
          Pure MI Fishing is an independent mobile application. Not affiliated
          with, endorsed by, or sponsored by the State of Michigan, the
          Michigan Department of Natural Resources, or the Pure Michigan
          tourism campaign. All regulation summaries are simplified planning
          aids only — always verify at{" "}
          <a
            href="https://www.michigan.gov/dnr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#1e3a5f] transition-colors"
          >
            michigan.gov/dnr
          </a>{" "}
          before fishing.
        </p>
        <p className="text-[#0d2040] text-[11px] text-center">
          © {year} Pure MI Fishing. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
