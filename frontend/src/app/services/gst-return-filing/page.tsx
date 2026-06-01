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
  Calendar,
  Receipt,
  IndianRupee,
  FileCheck,
} from "lucide-react";

export default function GSTReturnFilingPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    gstin: "",
    returnType: "",
    message: "",
    plan: "",
    acceptTerms: false,
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

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    const numericPhone = formData.phone.replace(/\D/g, "");
    if (numericPhone.length < 10) newErrors.phone = "Enter a valid phone number";

    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";

    if (formData.gstin.trim() && !/^[0-9A-Z]{15}$/i.test(formData.gstin.trim())) {
      newErrors.gstin = "GSTIN must be 15 characters";
    }

    if (!formData.returnType) newErrors.returnType = "Select a return type";

    if (!formData.plan) newErrors.plan = "Please select a plan";

    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification("Please login to submit a service request.", 'info');
      setTimeout(() => {
        router.push(`/login?redirect=/services/gst-return-filing`);
      }, 2000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: ServiceSubmission = {
        serviceType: 'GST Return Filing',
        userId: user.id,
        userEmail: user.email!,
        userName: formData.name,
        userPhone: formData.phone,
        plan: formData.plan,
        formData: {
          businessName: formData.businessName,
          gstin: formData.gstin,
          returnType: formData.returnType,
          message: formData.message,
        }
      };

      const result = await submitServiceRequest(submissionData);

      if (result.success) {
        setSubmittedServiceId(result.serviceRequest?.service_number || "");
        setShowSuccess(true);
      } else {
        showNotification(result.error || 'Service request failed', 'error');
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
                <FileCheck className="w-4 h-4" />
                Registrations & Licenses
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Annual GST Return Filing
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Stay compliant with timely GST return filing. Expert assistance for GSTR-1, GSTR-3B, and annual returns. Avoid penalties with professional support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-700/90" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  File Your Returns
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">₹999</div>
                  <div className="text-sm text-muted-foreground">Starting From/month</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">100%</div>
                  <div className="text-sm text-muted-foreground">Compliance</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                {[
                  { icon: Calendar, title: "Timely Filing", desc: "Never miss GST return deadlines" },
                  { icon: Receipt, title: "All Return Types", desc: "GSTR-1, GSTR-3B, GSTR-9 supported" },
                  { icon: IndianRupee, title: "Tax Optimization", desc: "Maximize ITC claims legally" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-gray-700/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Pricing Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "MONTHLY",
                price: "₹999",
                period: "/month",
                features: ["GSTR-1 Filing", "GSTR-3B Filing", "Basic Support", "Email Updates", "Document Preparation"]
              },
              {
                name: "QUARTERLY",
                price: "₹2,499",
                period: "/quarter",
                popular: true,
                features: ["QRMP Scheme", "Quarterly GSTR-1", "Monthly GSTR-3B", "ITC Reconciliation", "Priority Support"]
              },
              {
                name: "ANNUAL",
                price: "₹4,999",
                period: "/year",
                features: ["GSTR-9 Filing", "GSTR-9C Reconciliation", "CA Certification", "Audit Support", "Dedicated CA"]
              }
            ].map((plan, idx) => (
              <div key={idx} className={`rounded-2xl p-8 ${plan.popular ? 'bg-primary dark:bg-gray-700 text-primary-foreground dark:text-gray-100 border-2 border-primary dark:border-gray-600' : 'bg-card border border-border'} hover:shadow-xl transition-shadow relative`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary px-4 py-1 rounded-full text-sm font-semibold">RECOMMENDED</div>}
                <div className="text-sm font-semibold mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <div className="text-4xl font-bold">{plan.price}</div>
                  <div className="text-sm opacity-80">{plan.period}</div>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? '' : 'text-primary dark:text-gray-400'}`} />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GST Return Types */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">GST Return Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "GSTR-1", desc: "Outward supplies details" },
              { title: "GSTR-3B", desc: "Monthly summary return" },
              { title: "GSTR-9", desc: "Annual return" },
              { title: "GSTR-9C", desc: "Reconciliation statement" },
            ].map((type, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <FileText className="w-10 h-10 text-primary dark:text-gray-400 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filing Process */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Filing Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Data Collection", desc: "Provide sales/purchase records" },
              { step: "02", title: "Verification", desc: "We verify all entries" },
              { step: "03", title: "Return Filing", desc: "File returns on GST portal" },
              { step: "04", title: "Confirmation", desc: "Receive filing confirmation" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="text-4xl font-bold text-primary/20 dark:text-gray-400/20 mb-2">{item.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 text-primary dark:text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose Our GST Filing Service?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "100% Compliance", desc: "Stay fully compliant with GST laws and regulations" },
              { icon: Calendar, title: "Timely Filing", desc: "Never miss deadlines and avoid late fees" },
              { icon: TrendingUp, title: "ITC Optimization", desc: "Maximize your input tax credit claims" },
              { icon: FileCheck, title: "Expert Support", desc: "Professional CA assistance throughout" },
              { icon: Receipt, title: "Accurate Returns", desc: "Error-free filing with thorough verification" },
              { icon: IndianRupee, title: "Cost Effective", desc: "Affordable pricing for all business sizes" },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <benefit.icon className="w-12 h-12 text-primary dark:text-gray-400 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What is the due date for GST return filing?", a: "GSTR-1 is due by 11th, GSTR-3B by 20th of next month. Quarterly filers have different due dates. Annual returns (GSTR-9) are due by 31st December." },
              { q: "What happens if I miss the GST filing deadline?", a: "Late filing attracts penalty of ₹50 per day (₹20 for nil returns) under CGST and SGST each, subject to maximum of ₹5,000. Interest is also applicable on delayed tax payment." },
              { q: "What is QRMP scheme?", a: "Quarterly Return Monthly Payment (QRMP) allows small taxpayers (turnover up to ₹5 crore) to file GSTR-1 quarterly while paying tax monthly through PMT-06." },
              { q: "Do I need to file GST return if there's no business?", a: "Yes, you must file nil returns even if there's no business activity during the month/quarter. Failure to file may result in penalty." },
              { q: "What is GSTR-9C?", a: "GSTR-9C is a reconciliation statement between annual return (GSTR-9) and audited financial statements. It's mandatory for taxpayers with turnover above ₹5 crore." },
            ].map((faq, idx) => (
              <details key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow group">
                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary dark:text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Start Filing Your GST Returns</h2>
            <p className="text-muted-foreground">Fill out the form and our GST experts will contact you within 24 hours</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                {errors.name && <p className="text-sm text-destructive mt-2">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                {errors.email && <p className="text-sm text-destructive mt-2">{errors.email}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                {errors.phone && <p className="text-sm text-destructive mt-2">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Business Name *</label>
                <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="ABC Enterprises" />
                {errors.businessName && <p className="text-sm text-destructive mt-2">{errors.businessName}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">GSTIN</label>
                <Input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
                {errors.gstin && <p className="text-sm text-destructive mt-2">{errors.gstin}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Return Type *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.returnType}
                  onChange={(e) => setFormData({ ...formData, returnType: e.target.value })}
                >
                  <option value="">Select return type</option>
                  <option value="monthly">Monthly Filing</option>
                  <option value="quarterly">Quarterly Filing (QRMP)</option>
                  <option value="annual">Annual Return (GSTR-9)</option>
                </select>
                {errors.returnType && <p className="text-sm text-destructive mt-2">{errors.returnType}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Select Plan *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              >
                <option value="">Choose a plan</option>
                <option value="monthly">Monthly - ₹999/month</option>
                <option value="quarterly">Quarterly - ₹2,499/quarter (Recommended)</option>
                <option value="annual">Annual Return - ₹4,999/year</option>
              </select>
              {errors.plan && <p className="text-sm text-destructive mt-2">{errors.plan}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Additional Information</label>
              <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your business turnover, any specific requirements..." rows={3} />
            </div>

            <div className="flex items-start gap-2 mb-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              />
              <label className="text-sm text-muted-foreground">
                I agree to the Terms & Conditions and authorize Turn2Law to contact me via phone/email *
              </label>
            </div>

            {errors.acceptTerms && <p className="text-sm text-destructive mb-6">{errors.acceptTerms}</p>}

            {!user ? (
              <div className="bg-muted p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-4">Please login to submit your application</p>
                <Button
                  type="button"
                  onClick={() => router.push(`/login?redirect=/services/gst-return-filing`)}
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
