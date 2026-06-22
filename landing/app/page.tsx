import Nav from "./_components/Nav";
import Hero from "./_components/Hero";
import ProblemSection from "./_components/ProblemSection";
import ProductSection from "./_components/ProductSection";
import DetroitSection from "./_components/DetroitSection";
import AppPreviewSection from "./_components/AppPreviewSection";
import OfflineSection from "./_components/OfflineSection";
import LicenseSection from "./_components/LicenseSection";
import TrustSection from "./_components/TrustSection";
import CtaSection from "./_components/CtaSection";
import Footer from "./_components/Footer";

/**
 * Pure MI Fishing — Landing Page
 *
 * SEO targets: Michigan fishing app, Detroit River fishing map,
 * offline fishing maps Michigan, Michigan fishing regulations,
 * Detroit River walleye fishing, Michigan boat launches,
 * fishing license Michigan, Michigan fishing conditions,
 * ice fishing Michigan, spearfishing Michigan
 *
 * Structured content: h1 in Hero, h2 in every section,
 * aria-label/aria-labelledby on all sections, semantic article tags.
 *
 * Not affiliated with or endorsed by the State of Michigan or Michigan DNR.
 */
export default function HomePage() {
  return (
    <>
      {/* Sticky navigation */}
      <Nav />

      <main id="main-content" tabIndex={-1}>
        {/* 1. Hero — cinematic above-fold */}
        <Hero />

        {/* 2. Problem — why anglers need this (light bg) */}
        <ProblemSection />

        {/* 3. Product features — 8-card grid (dark bg) */}
        <ProductSection />

        {/* 4. Detroit River MVP — 6 region cards (dark bg) */}
        <DetroitSection />

        {/* 5. App screen previews — CSS phone mockups (light bg) */}
        <AppPreviewSection />

        {/* 6. Offline first — glassmorphism + pack list (dark bg) */}
        <OfflineSection />

        {/* 7. License handoff — official DNR CTA (light bg) */}
        <LicenseSection />

        {/* 8. Trust & compliance — 6 trust cards + disclaimer (dark bg) */}
        <TrustSection />

        {/* 9. Early access CTA — email waitlist (dark bg) */}
        <CtaSection />
      </main>

      {/* 10. Footer — links, disclaimer, copyright */}
      <Footer />
    </>
  );
}
