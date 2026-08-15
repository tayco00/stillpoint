import { StillpointApp } from "./components/StillpointApp";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stillpoint",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  inLanguage: "de",
  description:
    "Ein privater Fokus-Workspace mit Timer, Atempausen, Energie-Check-in und lokalem Tagesfortschritt.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function Home() {
  return (
    <>
      <StillpointApp />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
