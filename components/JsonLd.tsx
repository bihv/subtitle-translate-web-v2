"use client";

type JsonLdProps = {
  data: Record<string, any>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

export function WebsiteSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SubtitleAI",
    "url": "https://translate.io.vn",
    "description": "Translate subtitles from SRT files using Gemini AI",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://translate.io.vn/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return <JsonLd data={websiteSchema} />;
}

export function SoftwareApplicationSchema() {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SubtitleAI",
    "applicationCategory": "WebApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "operatingSystem": "Any",
    "description": "AI-powered subtitle translation tool using Gemini AI"
  };

  return <JsonLd data={appSchema} />;
}

export function OrganizationSchema() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SubtitleAI",
    "url": "https://translate.io.vn",
    "logo": "https://translate.io.vn/logo.png",
    "sameAs": [
      "https://twitter.com/subtitleai",
      "https://facebook.com/subtitleai"
    ]
  };

  return <JsonLd data={orgSchema} />;
} 