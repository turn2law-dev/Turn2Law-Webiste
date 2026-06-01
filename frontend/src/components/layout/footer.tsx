"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Linkedin, ArrowUp } from "lucide-react";

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="22" height="28" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.2048 0L11.4096 6.19541L13.4028 8.16545L15.8223 5.57886V20.2762L2.51237 6.72721C1.58129 5.77941 0 6.45738 0 7.80434V30H2.76506V10.9846L16.075 24.5337C17.006 25.4814 18.5874 24.8036 18.5874 23.4565V5.57886L21.0069 8.16545L23 6.19541L17.2048 0Z"
        fill="currentColor"
      />
    </svg>
    <span className="font-semibold text-base tracking-tight">Turn2Law</span>
  </div>
);

const contactItems = [
  { icon: Mail, label: "turntwolaw@gmail.com", href: "mailto:turntwolaw@gmail.com" },
  { icon: Phone, label: "+91 70116 37070", href: "tel:+917011637070" },
  { icon: MapPin, label: "Chennai, India", href: "#" },
];

const footerLinks = [
  {
    heading: "PRODUCT",
    links: [
      { label: "LawGPT", href: "/lawgpt" },
      { label: "Legal Navigator", href: "/legal-navigator" },
      { label: "Documents", href: "/documents" },
      { label: "Consult a lawyer", href: "/consult" },
    ],
  },
  {
    heading: "SERVICES",
    links: [
      { label: "GST Registration", href: "/services/gst-registration" },
      { label: "Private Limited", href: "/services/private-limited" },
      { label: "LLP", href: "/services/llp" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms-of-service" },
    ],
  },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-muted/40 border-t border-border/40">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Logo />
            <p className="mt-3 text-sm text-foreground/50 leading-relaxed max-w-xs">
              We Simplify Legal Access for Everyone.
            </p>

            <div className="mt-6 space-y-3">
              {contactItems.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} className="flex items-center gap-3 text-sm text-foreground/60 hover:text-foreground transition-colors group">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </span>
                  {label}
                </a>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/50 hover:border-primary/40 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/50 hover:border-primary/40 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-foreground/40">
            © 2026 Turn2Law. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-xs font-medium text-foreground/50 hover:border-primary/40 hover:text-foreground transition-colors"
          >
            Back to top <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
