"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactFormAction, type ContactFormState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Mail, Phone, MapPin, Linkedin } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const contactCards = [
  { icon: Mail,     label: "EMAIL",  value: "turntwolaw@gmail.com", href: "mailto:turntwolaw@gmail.com" },
  { icon: Phone,    label: "PHONE",  value: "+91 70116 37070",       href: "tel:+917011637070" },
  { icon: MapPin,   label: "OFFICE", value: "Chennai, India",        href: "#" },
  { icon: Linkedin, label: "FOLLOW", value: "LinkedIn",              href: "https://linkedin.com" },
];

export default function ContactForm() {
  const contactInitialState: ContactFormState = { message: "" };
  const [contactState, contactFormAction] = useActionState(sendContactFormAction, contactInitialState);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (contactState.message && !contactState.error) {
      toast({ title: "Message sent!", description: contactState.message });
      formRef.current?.reset();
    } else if (contactState.error) {
      toast({ title: "Error", description: contactState.error, variant: "destructive" });
    }
  }, [contactState, toast]);

  return (
    <section
      id="contact"
      className="section-with-orbs min-h-screen flex flex-col items-center justify-center bg-background py-16 px-6 overflow-hidden"
    >
      <div className="w-full max-w-3xl text-center">

        {/* Badge */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.80, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 glass-card px-5 py-2 text-xs font-medium text-foreground/60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Contact
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={prefersReducedMotion ? false : { opacity: 0, y: 80, filter: "blur(18px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.05, ease: EASE }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight mb-3"
        >
          Got a question?{" "}
          <span className="text-primary">Let&apos;s talk.</span>
        </motion.h2>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
          className="text-base text-foreground/50 mb-8 max-w-md mx-auto"
        >
          We typically respond within 4 hours during business days. For urgent legal matters, give us a call.
        </motion.p>

        {/* Contact cards — stagger */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {contactCards.map(({ icon: Icon, label, value, href }, i) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 65, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.14, ease: EASE }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="flex flex-col items-center gap-2 rounded-2xl glass-card glass-card-hover p-4 group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/35">{label}</p>
              <p className="text-xs font-medium text-foreground/65 text-center leading-tight">{value}</p>
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-7">
          <motion.div
            className="flex-1 h-px bg-border/35"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.05, ease: EASE }}
            style={{ transformOrigin: "left" }}
          />
          <span className="text-[10px] font-semibold tracking-widest text-foreground/30 uppercase flex-shrink-0">Or send a message</span>
          <motion.div
            className="flex-1 h-px bg-border/35"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.05, ease: EASE }}
            style={{ transformOrigin: "right" }}
          />
        </div>

        {/* Form */}
        <motion.form
          ref={formRef}
          action={contactFormAction}
          className="text-left"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
            {[
              { name: "firstName", label: "First name",    type: "text"  },
              { name: "lastName",  label: "Last name",     type: "text"  },
              { name: "email",     label: "Email address", type: "email" },
              { name: "phone",     label: "Phone number",  type: "tel"   },
            ].map((f) => (
              <input
                key={f.name}
                type={f.type}
                name={f.name}
                placeholder={f.label}
                className="w-full bg-transparent border-0 border-b border-border/45 pb-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
              />
            ))}
          </div>

          <textarea
            name="message"
            placeholder="What's on your mind?"
            rows={2}
            className="w-full bg-transparent border-0 border-b border-border/45 pb-2.5 mb-7 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors resize-none"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/35">
              By submitting, you agree to our{" "}
              <Link href="/privacy-policy" className="underline hover:text-foreground transition-colors">
                privacy policy
              </Link>.
            </p>
            <button
              type="submit"
              className="group flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3 text-sm transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
            >
              Send message
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </motion.form>

        {/* Social */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Follow us</span>
          {[
            {
              href: "https://instagram.com",
              icon: (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              ),
            },
            { href: "https://linkedin.com", icon: <Linkedin className="h-4 w-4" /> },
          ].map(({ href, icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full glass-card text-foreground/45 hover:text-primary transition-colors"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
