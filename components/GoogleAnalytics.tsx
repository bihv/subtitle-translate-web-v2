"use client";

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { initGA } from '@/lib/analytics';

export default function GoogleAnalytics() {
  // Use state to prevent rendering on server
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    setMounted(true);
    // Delay analytics initialization to improve page load performance
    const timer = setTimeout(() => {
      initGA();
    }, 2000); // 2 seconds delay
    
    return () => clearTimeout(timer);
  }, []);

  // Only render scripts after component has mounted on client
  if (!mounted) return null;

  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-P374H6F49M';

  return (
    <>
      {/* Load GA script with lower priority to improve Core Web Vitals */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload" // Changed from afterInteractive for better performance
        id="ga-script"
      />
      
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // Configure with anonymize_ip for GDPR compliance
          gtag('config', '${gaId}', {
            'anonymize_ip': true,
            'page_title': document.title,
            'page_path': window.location.pathname + window.location.search
          });
        `}
      </Script>
      
      {/* Noscript tag for better SEO compliance */}
      <noscript>
        <iframe 
          src={`https://www.googletagmanager.com/ns.html?id=${gaId}`}
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
} 