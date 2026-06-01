"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-background via-background to-background dark:from-black dark:via-[#0A0A0A] dark:to-black border-b border-border">
        <div className="container mx-auto px-6 py-16 lg:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Link>
          <h1 className="font-heading text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Last Updated: February 2026
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-16 lg:py-24 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We at Turn2Law (also referred to as "we," "our," or "us") are committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you engage with our legal consultancy services, visit our website, or communicate with us.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Throughout this notice, the term "personal data" is used to represent any information relating to an identified or identifiable person; country-specific notices might adopt a different terminology. We encourage you to read this notice, together with any additional and more specific information we may provide to you on various occasions when we are collecting or processing personal data on the Turn2Law website, so that you are aware of how and the purpose for which we are processing your personal data.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using our services, you agree to the collection and use of information as described herein.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Personal Identification Information
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Name, email address, phone number, address</li>
                  <li>Professional and employment-related information (job title, company name, business sector, country of residence)</li>
                  <li>Communication data (emails, phone conversations, meeting notes)</li>
                  <li>Payment and billing information, where applicable</li>
                </ul>
              </div>

              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Usage Data from Website Interactions
                </h3>
                <p className="text-muted-foreground mb-3">
                  Our web servers or Affiliates who provide analytics and performance enhancement services may collect:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>IP addresses</li>
                  <li>Operating system details</li>
                  <li>Browsing details</li>
                  <li>Device and connectivity details</li>
                  <li>Language settings</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  This information is aggregated to measure the number of visits, average time spent on the site, pages viewed and similar information. Turn2Law uses this information to measure the site usage, improve content and to ensure safety and security as well as enhance performance and user experience of the website.
                </p>
              </div>

              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Data from Third Parties
                </h3>
                <p className="text-muted-foreground mb-3">
                  We may also obtain data from third parties, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Social networks, when you grant permission to us to access your data on one or more networks through our website</li>
                  <li>Service providers, who help us to determine a location based on your IP address in order to customize offerings and content to your location</li>
                  <li>Partners with whom we offer co-branded services or engage in joint marketing activities</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                <strong>Age Restriction:</strong> The Turn2Law's website is not directed at nor targeted at children. No one who has not reached the age of thirteen may use the websites unless supervised by an adult. By accessing this website, you represent and warrant that you are 13 years of age or older.
              </p>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your data is used by us in part for administering, managing and developing our business and services; such as identifying existing and potential client needs, analysing and evaluating the strength of our interactions with client/lawyer contacts, performing analytics including to produce metrics such as relationship maps for our business leadership and limited profiling for the purposes of helping us to develop and offer appropriate products and services to existing and potential clients.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">To provide, operate, and maintain services</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">To improve our services and customer experience</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">To communicate with you, including responding to inquiries or requests</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">To process payments and manage billing</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">To comply with legal and regulatory obligations</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">For marketing and promotional purposes, with your consent</p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              We will only use your personal data for the purposes for which we collected it, unless we reasonably consider that we need to use it for another reason that is compatible with the original purpose and applicable law. If we need to use your personal data for an unrelated purpose, we will notify you and we will explain the legal basis which allows us to do so.
            </p>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Information Sharing and Disclosure
            </h2>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-6 mb-6">
              <p className="text-green-900 dark:text-green-200 font-semibold">
                We do not sell your personal data.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may share information within affiliated companies or trusted third-party service providers under confidentiality agreements to deliver our services.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Turn2Law may provide links to third-party websites for your convenience and information. If you access those links through the Turn2Law website, you will leave the Turn2Law website. Turn2Law does not control those sites or their privacy practices, which may differ from Turn2Law's practices. We do not endorse or make any representations about third-party websites.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose information if required by law, regulation, or legal process, or to protect rights, property, or safety.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Cookies and Tracking Technologies
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Turn2Law uses cookies (small text files placed on your device) and similar technologies to facilitate the proper functioning of our websites and to help collect data. The text in a cookie often consists of a string of numbers and letters that uniquely identifies your computer, but it can contain other information as well.
            </p>
            <div className="space-y-3">
              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Storing Preferences and Settings</h3>
                <p className="text-muted-foreground text-sm">Settings that enable our website to operate correctly or that maintain your preferences over time may be stored on your device.</p>
              </div>
              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Sign-in and Authentication</h3>
                <p className="text-muted-foreground text-sm">When you sign into our website using your credentials, we store a unique ID number, and the time you signed in, in an encrypted cookie on your device.</p>
              </div>
              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Security</h3>
                <p className="text-muted-foreground text-sm">We use cookies to detect fraud and abuse of our websites and services.</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You have control over cookie settings through your browser and can opt out where applicable.
            </p>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Data Storage and Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We have put in place appropriate technical, organisational and security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Encryption</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">Personal data is stored securely using encryption</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Access Controls</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">Protected by strict access controls</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We have put in place procedures to deal with any suspected data security breach and will notify you and any applicable regulator of a suspected breach where we are legally required to do so.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Your rights may differ depending on applicable data protection local laws. We respect your right to be informed, access, correct, request deletion or request restriction, portability, objection, and rights in relation to automated decision making and profiling, in our usage of your personal information as may be required under applicable law.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Know</h3>
                  <p className="text-muted-foreground text-sm">You have the right to know what personal information we maintain about you</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Access</h3>
                  <p className="text-muted-foreground text-sm">We will provide you with a copy of your personal information in a structured, commonly used and machine-readable format on request</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Correct</h3>
                  <p className="text-muted-foreground text-sm">If your personal information is incorrect or incomplete, you have the right to ask us to update it</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Object</h3>
                  <p className="text-muted-foreground text-sm">You have the right to object to our processing of your personal information</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Delete</h3>
                  <p className="text-muted-foreground text-sm">You can also ask us to delete or restrict how we use your personal information</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Withdraw Consent</h3>
                  <p className="text-muted-foreground text-sm">You can withdraw your consent at any time (which shall not affect the lawfulness of processing based on consent before its withdrawal)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to update this privacy notice at any time, and we will provide you with a new privacy notice when we make any substantial updates. We may also notify you in other ways from time to time about the processing of your personal data. This Privacy Statement is effective from February 2026 and it supersedes all existing policies on the subject matter.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If you have a privacy concern, complaint or a question regarding this privacy statement, please contact us through the "Get in Touch" section on turn2law.tech, where you provided your Personal data, indicating your concern in detail.
            </p>
            <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                Turn2Law
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  turntwolaw@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +91 9906102527
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Chennai, India
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
