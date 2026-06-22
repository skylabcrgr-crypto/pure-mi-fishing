import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Pure MI Fishing",
  description:
    "Privacy policy for Pure MI Fishing, an independent Michigan fishing field companion app. Catch logs are stored locally on your device. We do not sell personal fishing data.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    heading: "Independent App",
    body: "Pure MI Fishing is an independent mobile application. It is not affiliated with, endorsed by, or sponsored by the State of Michigan, the Michigan Department of Natural Resources (DNR), or the Pure Michigan tourism campaign.",
  },
  {
    heading: "Local-First Data",
    body: "In this MVP release, your catch logs, saved spots, and trip history are stored locally on your device only. This information is not transmitted to or stored on our servers.",
  },
  {
    heading: "No Sale of Personal Data",
    body: "We do not sell, rent, or trade your personal fishing data. Your fishing activity belongs to you.",
  },
  {
    heading: "Regulations Are Planning Summaries",
    body: "All regulation information in the app is provided as a simplified planning summary only. You are responsible for verifying current, official Michigan DNR regulations at michigan.gov/dnr before fishing.",
  },
  {
    heading: "License Purchases",
    body: "Pure MI Fishing never processes payments. Fishing license purchases are handled entirely through the official Michigan DNR website. We simply link you to the official source.",
  },
  {
    heading: "Future Updates",
    body: "This policy is a placeholder for the MVP and will be expanded and updated before any public release. If we introduce accounts, cloud sync, or analytics in the future, this policy will be revised and you will be notified.",
  },
];

export default function PrivacyPage() {
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
          Privacy Policy
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
