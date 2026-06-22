import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use — Pure MI Fishing",
  description:
    "Terms of use for Pure MI Fishing, an independent Michigan fishing field companion app. Regulations are simplified planning summaries; always verify official Michigan DNR rules.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    heading: "Independent App",
    body: "Pure MI Fishing is an independent mobile application. It is not affiliated with, endorsed by, or sponsored by the State of Michigan, the Michigan Department of Natural Resources (DNR), or the Pure Michigan tourism campaign.",
  },
  {
    heading: "Planning Aid Only",
    body: "The app provides simplified fishing regulation summaries, maps, conditions, and launch details as a planning aid only. It is not a substitute for official sources. You are solely responsible for verifying current, official Michigan DNR regulations at michigan.gov/dnr before fishing.",
  },
  {
    heading: "No Warranty",
    body: "Information is provided \u201cas is\u201d without warranty of any kind. Conditions, regulations, and access details change frequently. We do not guarantee the accuracy, completeness, or timeliness of any data in the MVP.",
  },
  {
    heading: "Your Responsibility on the Water",
    body: "You are responsible for your own safety, for holding a valid Michigan fishing license, and for complying with all applicable state and local laws. Always check official sources and use sound judgment on the water.",
  },
  {
    heading: "Local Data",
    body: "In this MVP, your catch logs and saved data are stored locally on your device. We do not sell your personal fishing data.",
  },
  {
    heading: "Future Updates",
    body: "These terms are a placeholder for the MVP and will be expanded and updated before any public release.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050f1d] text-[#f0f9ff] px-4 sm:px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#67e8f9] hover:text-[#a5f3fc] text-sm mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
          Terms of Use
        </h1>
        <p className="text-[#3d6070] text-sm mb-12">
          Last updated: June 2026 · MVP placeholder
        </p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-bold text-[#a5f3fc] mb-3">
                {s.heading}
              </h2>
              <p className="text-[#7da0b8] leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="section-divider my-12" />

        <p className="text-[#3d6070] text-xs leading-relaxed">
          Pure MI Fishing is an independent application. Not affiliated with,
          endorsed by, or sponsored by the State of Michigan, the Michigan
          Department of Natural Resources, or the Pure Michigan tourism
          campaign. Always verify current regulations at{" "}
          <a
            href="https://www.michigan.gov/dnr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#67e8f9] transition-colors"
          >
            michigan.gov/dnr
          </a>{" "}
          before fishing.
        </p>
      </div>
    </main>
  );
}
