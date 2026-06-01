"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
            Terms of Service
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
              Turn2Law ("the Platform", "we" or "us", or "our") values your privacy and is committed to ensuring that your privacy is protected. This Privacy Policy (the "Policy") explains how we collect, process, disclose, and protect the information of any lawyer or legal professional ("User" or "you" or "your") who visits, accesses, registers with, or uses our website{" "}
              <a href="https://www.turn2law.tech/" className="text-primary hover:underline">
                https://www.turn2law.tech/
              </a>{" "}
              (the "Site").
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This Privacy Policy applies to your access to or use of the Platform to the extent we collect your Personal Information in connection with our lawyer registration, verification, client-matching, and communication services (collectively, the "Services"). Please read this Privacy Policy carefully and in its entirety before using our Services.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-6 my-6">
              <p className="text-amber-900 dark:text-amber-200 font-semibold mb-2">
                ⚠️ Important Notice
              </p>
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                By visiting, accessing, registering with, or using the Site or any of our Services, or by creating and maintaining an account with us, you acknowledge that you have read, understood, and are bound to the most recent version of this Privacy Policy and our Terms of Use.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your continued access or use of the Site or Services after any updates to this Policy constitutes your ongoing acceptance of such revised terms. If you do not agree with this Privacy Policy or any part of it, you must immediately discontinue using our Site or Services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              At Turn2Law, we collect the following categories of information from Users who access, register, or use our Platform (collectively referred to as "Information"). We collect Information to operate effectively, improve our Services, enhance user experience, and ensure the secure and efficient functioning of our Platform.
            </p>

            <div className="space-y-4">
              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Personal Information
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We collect Information that you provide directly to us, such as:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
                  <li>Name, email address, phone number, password</li>
                  <li>Enrolment numbers and bar registration information</li>
                  <li>Qualifications and professional credentials</li>
                  <li>Documents necessary for verification</li>
                  <li>Any other details you submit when creating an account or communicating with us</li>
                </ul>
              </div>

              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Device and Technical Information
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Turn2Law collects Information about the devices, browsers, and applications you use to access our Services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
                  <li>Device identifiers, browser types, device configurations</li>
                  <li>Operating systems, network information, application versions</li>
                  <li>IP addresses, dates and times of access</li>
                  <li>Crash reports, system activities, and interaction data</li>
                </ul>
              </div>

              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Usage and Activity Data
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We collect data about your activity on the Platform to personalize and improve your experience:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
                  <li>Searches you perform and client profiles you view</li>
                  <li>Pages you visit and documents you upload</li>
                  <li>Communication activity with clients</li>
                  <li>Logs relating to your interactions within the Platform</li>
                </ul>
              </div>

              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Location Information
                </h3>
                <p className="text-muted-foreground text-sm">
                  Turn2Law may collect location information to support features such as displaying clients available in your region, enabling accurate scheduling, and ensuring compliance with jurisdiction-based regulatory requirements. You may manage your location preferences through your device or account settings.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Note:</strong> All the Information provided by you is voluntary. This Privacy Policy does not apply to any Information collected by Third-Party services not owned or controlled by Turn2Law.
              </p>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              How We Use the Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Turn2Law uses the Information collected from Users to facilitate seamless interactions between legal service providers and individuals seeking legal assistance. The Information enables the Platform to:
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Match Users with suitable clients based on expertise and preferences</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Verify the authenticity and qualifications of lawyers listed on the Platform</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Maintain accurate and updated professional profiles</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Enhance functionality, personalize User experience, and recommend relevant clients</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Detect, prevent, and address fraud, unauthorized access, and abuse</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Comply with legal, regulatory, and statutory obligations</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Analyze Platform usage patterns and improve system efficiency</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-6">
              <p className="text-green-900 dark:text-green-200 font-semibold">
                Privacy Commitment
              </p>
              <p className="text-green-800 dark:text-green-300 text-sm mt-2">
                Except as expressly stated in this Privacy Policy, Turn2Law does not publish, sell, rent, market, disclose, or otherwise share your Personal Information with any third party without your explicit consent.
              </p>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Information We Share and Disclose
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We may share or disclose your Information only when necessary to fulfil the purposes outlined in this Policy. "Disclosure" refers to making your Information accessible to any person or entity outside Turn2Law, subject to lawful and contractual limitations.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">With Affiliates</h3>
                <p className="text-muted-foreground text-sm">
                  Information may be shared with entities that are under common ownership or control of Turn2Law, and with employees, agents, or contractors who require such access to perform legitimate operational functions under strict confidentiality obligations.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">With Service Providers</h3>
                <p className="text-muted-foreground text-sm">
                  We may share Information with Third Parties engaged to perform tasks such as hosting, data storage, security monitoring, analytics, customer support, communication facilitation, or payment processing.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Legal Requirements</h3>
                <p className="text-muted-foreground text-sm">
                  Disclosure may be mandated by law, court orders, regulatory directives, or government investigations. In such cases, we will ensure that any disclosure complies with principles of necessity and proportionality.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Business Transfers</h3>
                <p className="text-muted-foreground text-sm">
                  In circumstances involving mergers, acquisitions, restructuring, or sale of all or part of our business, your Information may be transferred as part of corporate assets to the successor entity.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Aggregated Data</h3>
                <p className="text-muted-foreground text-sm">
                  Aggregated or pseudonymised data that cannot identify you personally may be shared for research, academic, or compliance purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              How We Store and Protect Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Turn2Law stores all Information collected from Users on secure servers that implement advanced technical controls, including encryption protocols and firewall protections, in accordance with industry best practices and the requirements of applicable Indian data protection laws, including the Digital Personal Data Protection Act, 2023 ("DPDPA 2023").
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🔐 Encryption</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">Secure encryption during data transmission and storage</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🛡️ Access Control</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">Strict access controls for authorized personnel only</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🔍 Regular Audits</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">Periodic security audits and vulnerability assessments</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Compliance</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">Full compliance with DPDPA 2023 standards</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
              <p className="text-amber-900 dark:text-amber-200 text-sm">
                <strong>Important:</strong> Despite these measures, the Company cannot guarantee the absolute security of data transmitted over the internet. Users are expected to maintain the confidentiality of their account credentials.
              </p>
            </div>
          </section>

          {/* User Rights */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              User Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Turn2Law is committed to ensuring that every User is fully informed of their data protection rights under applicable laws. As a User of the Platform, you have the following rights:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Access</h3>
                  <p className="text-muted-foreground text-sm">Request access to the Personal Information that we hold about you</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Rectification</h3>
                  <p className="text-muted-foreground text-sm">Seek correction of any inaccurate or incomplete Personal Information</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Erasure</h3>
                  <p className="text-muted-foreground text-sm">Request the deletion of your Personal Information where permitted by law</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Restriction</h3>
                  <p className="text-muted-foreground text-sm">Request restrictions on the processing of your Personal Information</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Data Portability</h3>
                  <p className="text-muted-foreground text-sm">Request transfer of your Personal Information to another organization</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Right to Object</h3>
                  <p className="text-muted-foreground text-sm">Object to the manner in which we process your Information</p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-6">
              To exercise any of these rights, you may contact us at the details provided below, and Turn2Law will acknowledge, process, and respond to your request within thirty days.
            </p>
          </section>

          {/* Representations and Warranties */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Representations and Warranties
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Your Representations
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  By accessing or using the Platform, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
                  <li>All Information you provide is accurate, complete, current, and truthful</li>
                  <li>You are a practicing lawyer or legal professional duly authorized under Indian law</li>
                  <li>You hold valid credentials, licenses, enrollments, and professional qualifications</li>
                  <li>All documents and certificates submitted are genuine and legally obtained</li>
                  <li>Your use of the Platform complies with all applicable laws and professional ethics</li>
                </ul>
              </div>

              <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Our Representations
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Turn2Law represents and warrants that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
                  <li>We will process your Information in compliance with applicable data protection laws</li>
                  <li>We will adopt reasonable security practices to safeguard your information</li>
                  <li>We will not disclose your Personal Information except as permitted under this Policy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Indemnity and Liability */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Indemnity and Limitation of Liability
            </h2>
            
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-3">
                User Indemnity
              </h3>
              <p className="text-red-800 dark:text-red-300 text-sm">
                You agree to indemnify, defend, and hold harmless Turn2Law from any claims, liabilities, losses, damages, or expenses arising from your breach of this Policy, violation of any law, professional misconduct, provision of inaccurate information, or misuse of the Platform.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-3">
                Limitation of Liability
              </h3>
              <p className="text-orange-800 dark:text-orange-300 text-sm mb-3">
                To the maximum extent permitted by law, Turn2Law shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-orange-800 dark:text-orange-300 text-sm space-y-2">
                <li>Any indirect, incidental, special, punitive, or consequential damages</li>
                <li>Loss of business, revenue, profits, reputation, data, or goodwill</li>
                <li>Third-Party acts, cyber-attacks, technical failures, or service disruptions</li>
              </ul>
              <p className="text-orange-800 dark:text-orange-300 text-sm mt-3">
                <strong>Maximum Liability:</strong> Turn2Law's total cumulative liability shall not exceed the total amount paid by you to Turn2Law during the twelve months preceding the event giving rise to the claim.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your Information only for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, and resolve disputes. Once the Information is no longer required, we securely delete or anonymize it in accordance with applicable laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may request deletion of your Information at any time through our grievance mechanism. We adhere to the principle of data minimization under the DPDPA 2023, ensuring that only relevant and necessary data is retained.
            </p>
          </section>

          {/* Change of Ownership */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Change of Ownership
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a change in ownership, merger, acquisition, or transfer of assets, we reserve the right to transfer all of your Information to the successor entity. We will use reasonable efforts to notify registered Users of any such transfer by posting on our homepage or by email.
            </p>
          </section>

          {/* Policy Towards Children */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Policy Towards Children
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-6">
              <p className="text-yellow-900 dark:text-yellow-200 font-semibold mb-2">
                ⚠️ Age Restriction
              </p>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                The Services are only intended for Users who are 18 years of age or older and otherwise competent to contract. If you are not of the requisite age, you must not provide any User Information. Turn2Law shall have the right to revoke the provision of Services and delete accounts of non-compliant Users without notice.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Changes in this Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may change this Privacy Policy from time to time. The most recent version will always be posted on the Website, with the "Effective Date" posted at the top. We may revise and update this Policy if our practices change, as technology changes, or as we add new services or change existing ones.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If we make any material changes to our Privacy Policy or how we handle your Information, we will give you a reasonable opportunity to consent to the change. By using our Website or Services after the Effective Date, you are deemed to consent to our then-current Privacy Policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If you have questions, concerns, or feedback regarding this Privacy Policy, please contact us:
            </p>
            <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-6 border border-border">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                Turn2Law Support
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +91 9906102527
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  turntwolaw@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href="https://www.turn2law.tech" className="text-primary hover:underline">
                    www.turn2law.tech
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
