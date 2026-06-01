"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useRouter } from "next/navigation";
import { checkServiceAuth, submitServiceRequest, ServiceSubmission } from "@/lib/service-requests";
import { SuccessDialog } from "@/components/service-tracking/SuccessDialog";
import { useNotification } from '@/contexts/notification-context';
import {
  CheckCircle,
  FileText,
  Shield,
  TrendingUp,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Ship,
  IndianRupee,
  Package,
} from "lucide-react";

export default function IECPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    pan: "",
    selectedPlan: "",
    message: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedServiceId, setSubmittedServiceId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { user: currentUser } = await checkServiceAuth();
      setUser(currentUser);
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          name: currentUser.user_metadata?.full_name || "",
          email: currentUser.email || "",
          phone: currentUser.user_metadata?.phone || "",
        }));
      }
    };
    init();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    const numericPhone = formData.phone.replace(/\D/g, "");
    if (numericPhone.length < 10) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Select a business type";
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan.trim())) {
      newErrors.pan = "Enter a valid PAN (ABCDE1234F)";
    }

    if (!formData.selectedPlan) {
      newErrors.selectedPlan = "Please select a plan";
    }

    if (!formData.consent) {
      newErrors.consent = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/services/iec`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: ServiceSubmission = {
        serviceType: 'Import Export Code (IEC) Registration',
        userId: user.id,
        userEmail: user.email!,
        userName: formData.name,
        userPhone: formData.phone,
        plan: formData.selectedPlan,
        formData: {
          businessName: formData.businessName,
          businessType: formData.businessType,
          pan: formData.pan,
          message: formData.message,
        }
      };

      const result = await submitServiceRequest(submissionData);

      if (result.success) {
        setSubmittedServiceId(result.serviceRequest?.service_number || "");
        setShowSuccess(true);
      } else {
        showNotification(result.error || 'Submission failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-gray-700/10 text-primary dark:text-gray-400 text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Registrations & Licenses
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Import Export Code (IEC)
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Start your import/export business with an IEC registration. Mandatory for international trade, valid for a lifetime. Quick processing and expert support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-700/90" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Register Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">₹2,999</div>
                  <div className="text-sm text-muted-foreground">Starting From</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">Lifetime</div>
                  <div className="text-sm text-muted-foreground">Validity</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-gray-700/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-primary dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Global Trade Ready</h3>
                      <p className="text-sm text-muted-foreground">Import & export from 180+ countries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-gray-700/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Lifetime Validity</h3>
                      <p className="text-sm text-muted-foreground">One-time registration, no renewals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-gray-700/10 flex items-center justify-center flex-shrink-0">
                      <Ship className="w-6 h-6 text-primary dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Fast Processing</h3>
                      <p className="text-sm text-muted-foreground">Get your IEC in 7-10 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Transparent Pricing Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-sm font-semibold text-primary dark:text-gray-400 mb-2">BASIC</div>
              <div className="text-4xl font-bold text-foreground mb-4">
                ₹2,999
              </div>
              <p className="text-muted-foreground mb-6">Essential IEC registration</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">IEC Number Registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Document Preparation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Application Filing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Certificate Delivery</span>
                </li>
              </ul>
            </div>

            {/* Standard Plan */}
            <div className="bg-primary dark:bg-gray-700 text-primary-foreground dark:text-gray-100 border-2 border-primary dark:border-gray-600 rounded-2xl p-8 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                POPULAR
              </div>
              <div className="text-sm font-semibold mb-2">STANDARD</div>
              <div className="text-4xl font-bold mb-4">
                ₹4,999
              </div>
              <p className="text-primary-foreground/80 dark:text-gray-100/80 mb-6">Recommended package</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Basic</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority Processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">PAN-IEC Linking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Compliance Checklist</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated Support</span>
                </li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-sm font-semibold text-primary dark:text-gray-400 mb-2">PREMIUM</div>
              <div className="text-4xl font-bold text-foreground mb-4">
                ₹7,999
              </div>
              <p className="text-muted-foreground mb-6">Complete business setup</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Post-Registration Guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Export Compliance Training</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Legal Consultation (2 Sessions)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated Account Manager</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Documents Required
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "PAN Card", desc: "Of applicant/business" },
              { icon: FileText, title: "Aadhaar Card", desc: "Valid ID proof" },
              { icon: FileText, title: "Bank Certificate", desc: "Cancelled cheque" },
              { icon: FileText, title: "Passport Photo", desc: "Recent photograph" },
            ].map((doc, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <doc.icon className="w-10 h-10 text-primary dark:text-gray-400 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Registration Process
          </h2>
          <div className="space-y-6">
            {[
              { step: 1, title: "Submit Application", desc: "Fill out the form and provide required documents" },
              { step: 2, title: "Document Verification", desc: "We verify all documents and prepare your application" },
              { step: 3, title: "Application Filing", desc: "We file your IEC application with DGFT portal" },
              { step: 4, title: "Receive IEC Certificate", desc: "Get your IEC certificate in 7-10 business days" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-primary dark:bg-gray-700 text-primary-foreground dark:text-gray-100 flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Get an IEC?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Mandatory for Trade", desc: "Required for importing/exporting goods from India" },
              { icon: Shield, title: "Lifetime Validity", desc: "One-time registration with no renewal needed" },
              { icon: TrendingUp, title: "Business Expansion", desc: "Open doors to global markets and opportunities" },
              { icon: Package, title: "Customs Clearance", desc: "Essential for customs clearance of goods" },
              { icon: FileText, title: "No Compliance Burden", desc: "No annual returns or periodic filings required" },
              { icon: CheckCircle, title: "Quick Processing", desc: "Fast online application with minimal paperwork" },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <benefit.icon className="w-10 h-10 text-primary dark:text-gray-400 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What is an Import Export Code (IEC)?",
                a: "IEC is a 10-digit unique code issued by DGFT to Indian companies for importing or exporting goods and services. It is mandatory for international trade."
              },
              {
                q: "Who needs an IEC registration?",
                a: "Any individual, proprietorship, partnership, company, or LLP that wants to import or export goods or services from India needs an IEC."
              },
              {
                q: "How long does it take to get an IEC?",
                a: "Once all documents are submitted and verified, the IEC is typically issued within 7-10 business days."
              },
              {
                q: "Is IEC valid for a lifetime?",
                a: "Yes, IEC has lifetime validity and does not require any renewal. However, you need to update it if your business details change."
              },
            ].map((faq, idx) => (
              <details key={idx} className="bg-card border border-border rounded-xl p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary dark:text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-muted-foreground mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get Started Today
            </h2>
            <p className="text-muted-foreground">
              Fill out the form below and our experts will get in touch with you
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-sm text-destructive mt-2">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-sm text-destructive mt-2">{errors.email}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-sm text-destructive mt-2">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Name *
                </label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="ABC Exports"
                />
                {errors.businessName && <p className="text-sm text-destructive mt-2">{errors.businessName}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Type *
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                >
                  <option value="">Select business type</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="llp">LLP</option>
                  <option value="private-limited">Private Limited</option>
                </select>
                {errors.businessType && <p className="text-sm text-destructive mt-2">{errors.businessType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  PAN Number *
                </label>
                <Input
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.pan && <p className="text-sm text-destructive mt-2">{errors.pan}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Select Plan *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.selectedPlan}
                onChange={(e) => setFormData({ ...formData, selectedPlan: e.target.value })}
              >
                <option value="">Choose a plan</option>
                <option value="basic">Basic - ₹2,999</option>
                <option value="standard">Standard - ₹4,999 (Recommended)</option>
                <option value="premium">Premium - ₹7,999</option>
              </select>
              {errors.selectedPlan && <p className="text-sm text-destructive mt-2">{errors.selectedPlan}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Message
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your requirements..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 mb-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              />
              <label className="text-sm text-muted-foreground">
                I agree to the Terms & Conditions and authorize Turn2Law to contact me via phone/email *
              </label>
            </div>

            {errors.consent && <p className="text-sm text-destructive mb-6">{errors.consent}</p>}

            {!user ? (
              <div className="bg-muted p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-4">Please login to submit your application</p>
                <Button
                  type="button"
                  onClick={() => router.push(`/login?redirect=/services/iec`)}
                  className="w-full rounded-full"
                  variant="outline"
                >
                  Login to Apply
                </Button>
              </div>
            ) : (
              <Button type="submit" size="lg" className="w-full rounded-full bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-700/90" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </form>
        </div>
      </section>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        serviceNumber={submittedServiceId}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
