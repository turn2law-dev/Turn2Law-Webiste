"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useRef, useState } from "react";
import { findLawyerAction, sendContactFormAction, type FormState, type ContactFormState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const LawyerCard = ({
  lawyer,
}: {
  lawyer: {
    name: string;
    specialty: string;
    experienceYears: number;
    profileUrl: string;
  };
}) => (
  <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
    <Image
      src="https://placehold.co/100x100.png"
      alt={lawyer.name}
      width={80}
      height={80}
      className="rounded-full mb-4"
    />
    <h3 className="font-bold text-lg">{lawyer.name}</h3>
    <p className="text-primary">{lawyer.specialty}</p>
    <p className="text-sm text-muted-foreground">
      {lawyer.experienceYears} years experience
    </p>
    <Button asChild variant="link" className="mt-2">
      <Link href={lawyer.profileUrl} target="_blank">
        View Profile
      </Link>
    </Button>
  </div>
);

export default function ContactForm() {
  const initialState: FormState = { message: "" };
  const [state, formAction] = useActionState(findLawyerAction, initialState);
  const contactInitialState: ContactFormState = { message: "" };
  const [contactState, contactFormAction] = useActionState(sendContactFormAction, contactInitialState);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const contactFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.lawyers) {
      toast({
        title: state.error ? "Error" : "Success",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      });
    }
    if (state.lawyers && state.lawyers.length > 0) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  useEffect(() => {
    if (contactState.message) {
      toast({
        title: contactState.error ? "Error" : "Success",
        description: contactState.message,
        variant: contactState.error ? "destructive" : "default",
      });
      if (contactState.success) {
        contactFormRef.current?.reset();
      }
    }
  }, [contactState, toast]);

  return (
    <section id="find-lawyer" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-3xl border border-border/40 bg-muted/20 p-4 shadow-[0_24px_80px_-60px_rgba(0,0,0,0.35)] sm:p-6 md:p-10"
        >
          {state.lawyers && state.lawyers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-center"
            >
              <h2 className="mb-4 text-2xl font-body font-bold sm:text-3xl">
                {state.message}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {state.lawyers.map((lawyer, index) => (
                  <LawyerCard key={index} lawyer={lawyer} />
                ))}
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="mt-10 sm:mt-12"
              >
                Find More Lawyers
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
              {/* Left Side - Send us a message Form */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="rounded-2xl border border-border/40 bg-background/90 p-5 backdrop-blur-sm sm:p-6 lg:p-7"
              >
                {/* Section Header */}
                <div className="mb-8 max-w-md">
                  <h2 className="mb-3 text-3xl font-body font-bold leading-tight text-foreground lg:text-4xl">
                    Send us a <span className="text-primary">message</span>
                  </h2>
                  <p className="font-body text-base text-muted-foreground">
                    Have a question or something to share? Send us a message and
                    we'll get back to you shortly.
                  </p>
                </div>

                <form ref={contactFormRef} action={contactFormAction} className="space-y-5">
                  {/* First Name & Last Name Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="firstName" className="text-xs font-medium tracking-wide text-muted-foreground">
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        className="h-12 w-full rounded-xl border border-border/30 bg-muted/20 px-4 text-foreground placeholder:text-muted-foreground/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lastName" className="text-xs font-medium tracking-wide text-muted-foreground">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        className="h-12 w-full rounded-xl border border-border/30 bg-muted/20 px-4 text-foreground placeholder:text-muted-foreground/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address & Phone Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-medium tracking-wide text-muted-foreground">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email address"
                        className="h-12 w-full rounded-xl border border-border/30 bg-muted/20 px-4 text-foreground placeholder:text-muted-foreground/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="mobile" className="text-xs font-medium tracking-wide text-muted-foreground">
                        Phone number
                      </label>
                      <input
                        id="mobile"
                        type="tel"
                        name="mobile"
                        placeholder="Phone number"
                        className="h-12 w-full rounded-xl border border-border/30 bg-muted/20 px-4 text-foreground placeholder:text-muted-foreground/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-medium tracking-wide text-muted-foreground">
                      Your message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message"
                      className="min-h-[150px] w-full resize-none rounded-xl border border-border/30 bg-muted/20 px-4 py-3 text-foreground placeholder:text-muted-foreground/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={5}
                      required
                    />
                  </div>

                  {contactState?.error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                      <p className="text-sm text-destructive">{contactState.error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-start pt-1">
                    <Button
                      type="submit"
                      size="lg"
                      className="group rounded-full bg-primary px-9 text-primary-foreground hover:bg-primary/90"
                    >
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </form>
              </motion.div>

              {/* Right Side - Contact Info */}
              <motion.div
                className="rounded-2xl border border-border/40 bg-background/90 p-5 backdrop-blur-sm sm:p-6 lg:p-7"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              >
                {/* Section Header */}
                <div className="mb-8 max-w-sm">
                  <h3 className="mb-3 text-3xl font-body font-bold leading-tight text-foreground lg:text-4xl">
                    Get in <span className="text-primary">touch</span>
                  </h3>
                  <p className="text-muted-foreground">
                    We&apos;re here to help and answer any question you might have.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="mb-8 space-y-3.5">
                  {/* Email Card */}
                  <a
                    href="mailto:turntwolaw@gmail.com"
                    className="group flex items-start gap-4 rounded-xl border border-border/30 bg-muted/15 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-semibold font-body text-foreground">
                        What&apos;s next?
                      </h4>
                      <p className="text-sm text-muted-foreground transition-colors group-hover:text-primary">
                        turntwolaw@gmail.com
                      </p>
                    </div>
                  </a>

                  {/* Phone Card */}
                  <a
                    href="tel:+919906102527"
                    className="group flex items-start gap-4 rounded-xl border border-border/30 bg-muted/15 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-semibold font-body text-foreground">
                        Phone
                      </h4>
                      <p className="text-sm text-muted-foreground transition-colors group-hover:text-primary">
                        +91 9906102527
                      </p>
                    </div>
                  </a>

                  {/* Address Card */}
                  <div className="flex items-start gap-4 rounded-xl border border-border/30 bg-muted/15 p-4">
                    <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 dark:bg-primary/20">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-semibold font-body text-foreground">
                        Address
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Chennai, India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="border-t border-border/20 pt-6">
                  <h4 className="mb-4 text-lg font-semibold font-body text-foreground">
                    Connect with us
                  </h4>
                  <div className="flex gap-3">
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/turn2law"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-muted/25 text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/10"
                      aria-label="Follow us on Instagram"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href="https://www.linkedin.com/company/turn2law"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-muted/25 text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/10"
                      aria-label="Follow us on LinkedIn"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
