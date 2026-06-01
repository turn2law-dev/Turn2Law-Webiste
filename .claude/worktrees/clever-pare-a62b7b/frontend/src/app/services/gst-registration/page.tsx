"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getCurrentUser, getUserProfile } from "@/lib/supabase";
import { useNotification } from '@/contexts/notification-context';
import {
  CheckCircle,
  FileText,
  Shield,
  TrendingUp,
  ArrowRight,
  Phone,
  Mail,
  FileCheck,
  Receipt,
  IndianRupee,
} from "lucide-react";
import { SuccessDialog } from "@/components/service-tracking/SuccessDialog";

export default function GSTRegistrationPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    turnover: "",
    message: "",
    businessType: "",
    plan: "",
    businessAddress: "",
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedServiceId, setSubmittedServiceId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const profile = await getUserProfile(currentUser.id);
        setUser({ ...currentUser, ...profile });
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          name: profile?.full_name || "",
          email: currentUser.email || "",
          phone: profile?.phone || "",
        }));
      }
    };
    checkAuth();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    const numericPhone = formData.phone.replace(/\D/g, "");
    if (numericPhone.length < 10) newErrors.phone = "Enter a valid phone number";

    if (!formData.businessType) newErrors.businessType = "Select a business type";

    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";

    if (!formData.turnover.trim()) newErrors.turnover = "Turnover is required";

    if (!formData.businessAddress.trim()) newErrors.businessAddress = "Business address is required";

    if (!formData.plan) newErrors.plan = "Please select a plan";

    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if logged in
    if (!user) {
      showNotification("Please login to submit a service request.", 'info');
      setTimeout(() => {
        router.push(`/login?redirect=/services/gst-registration`);
      }, 2000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Create service request using new API
      const response = await fetch(`${apiUrl}/api/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: formData.email,
          userName: formData.name,
          userPhone: formData.phone,
          serviceType: 'GST Registration',
          plan: formData.plan || 'basic',
          formData: {
            businessName: formData.businessName,
            turnover: formData.turnover,
            businessType: formData.businessType,
            businessAddress: formData.businessAddress,
            message: formData.message,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmittedServiceId(data.serviceRequest?.service_number);
        setShowSuccess(true);
      } else {
        showNotification(data.error || 'Failed to submit application. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-gray-700/10 text-primary dark:text-gray-400 text-sm font-medium mb-6">
                <FileCheck className="w-4 h-4" />
                Registrations & Licenses
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                GST Registration
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Get your GST registration done hassle-free! Mandatory for businesses with turnover above ₹40 lakhs (₹20 lakhs for services). Claim input tax credit and expand your business legally.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-700/90" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Apply Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">₹2,999</div>
                  <div className="text-sm text-muted-foreground">Starting From</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">100%</div>
                  <div className="text-sm text-muted-foreground">Online Process</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                {[
                  { icon: Receipt, title: "Legal Compliance", desc: "Comply with GST laws and avoid penalties" },
                  { icon: TrendingUp, title: "Input Tax Credit", desc: "Claim ITC and reduce tax liability" },
                  { icon: IndianRupee, title: "Business Growth", desc: "Work with registered businesses easily" },
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

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Pricing Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "BASIC",
                price: "₹2,999",
                features: ["GST Registration", "GSTIN Certificate", "Filing Assistance", "Expert Guidance", "Email Support"]
              },
              {
                name: "STANDARD",
                price: "₹4,999",
                popular: true,
                features: ["Everything in Basic", "Return Filing (3 Months)", "Invoice Generation Tool", "Priority Support", "Compliance Calendar"]
              },
              {
                name: "PREMIUM",
                price: "₹9,999",
                features: ["Everything in Standard", "Annual Return Filing", "Tax Planning", "Dedicated CA", "Audit Support"]
              }
            ].map((plan, idx) => (
              <div key={idx} className={`rounded-2xl p-8 ${plan.popular ? 'bg-primary dark:bg-gray-700 text-primary-foreground dark:text-gray-100 border-2 border-primary dark:border-gray-600' : 'bg-card border border-border'} hover:shadow-xl transition-shadow relative`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary px-4 py-1 rounded-full text-sm font-semibold">POPULAR</div>}
                <div className="text-sm font-semibold mb-2">{plan.name}</div>
                <div className="text-4xl font-bold mb-4">{plan.price}</div>
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

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Registration Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Submit Documents", desc: "Provide required documents and business details" },
              { step: "02", title: "Application Filing", desc: "We file your GST application on the portal" },
              { step: "03", title: "Verification", desc: "Tax department verifies your documents" },
              { step: "04", title: "GSTIN Issued", desc: "Receive your 15-digit GST number" },
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

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Documents Required</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "PAN Card", desc: "Of business/proprietor" },
              { title: "Aadhaar Card", desc: "Of proprietor/partners" },
              { title: "Business Proof", desc: "Registration certificate" },
              { title: "Address Proof", desc: "Rent agreement/ownership" },
              { title: "Bank Details", desc: "Cancelled cheque/statement" },
              { title: "Photographs", desc: "Passport size" },
              { title: "Email & Mobile", desc: "Valid contact details" },
              { title: "Digital Signature", desc: "For companies/LLP" },
            ].map((doc, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <FileText className="w-10 h-10 text-primary dark:text-gray-400 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Key Benefits of GST Registration</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Legal Recognition", desc: "Gain legal recognition and credibility for your business in the market" },
              { icon: TrendingUp, title: "Input Tax Credit", desc: "Claim ITC on purchases and reduce your overall tax liability significantly" },
              { icon: Receipt, title: "Interstate Sales", desc: "Legally sell goods and services across all Indian states" },
              { icon: CheckCircle, title: "Government Tenders", desc: "Participate in government tenders and expand business opportunities" },
              { icon: IndianRupee, title: "Higher Threshold", desc: "Enjoy composition scheme benefits and simplified tax compliance" },
              { icon: FileCheck, title: "Easy Compliance", desc: "Simple online filing and management of tax returns" },
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

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Who needs GST registration?", a: "Businesses with annual turnover exceeding ₹40 lakhs (₹20 lakhs for services) must register for GST. Interstate suppliers and e-commerce sellers must register regardless of turnover." },
              { q: "How long does GST registration take?", a: "Typically 5-7 working days from the date of application submission with complete and accurate documents." },
              { q: "What is GSTIN?", a: "GSTIN (Goods and Services Tax Identification Number) is a unique 15-digit number assigned to every GST registered business." },
              { q: "Can I get GST registration for a home-based business?", a: "Yes, you can register a home-based business for GST using your residential address as the principal place of business." },
              { q: "Is GST registration free?", a: "Yes, GST registration is free on the government portal. You only pay for professional assistance and documentation services." },
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

      <section id="contact-form" className="py-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Apply for GST Registration</h2>
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
                <label className="block text-sm font-medium text-foreground mb-2">Business Type *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="pvt-ltd">Private Limited</option>
                  <option value="llp">LLP</option>
                  <option value="opc">OPC</option>
                </select>
                {errors.businessType && <p className="text-sm text-destructive mt-2">{errors.businessType}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Business Name *</label>
                <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="ABC Enterprises" />
                {errors.businessName && <p className="text-sm text-destructive mt-2">{errors.businessName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Annual Turnover *</label>
                <Input value={formData.turnover} onChange={(e) => setFormData({ ...formData, turnover: e.target.value })} placeholder="₹50,00,000" />
                {errors.turnover && <p className="text-sm text-destructive mt-2">{errors.turnover}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Business Address *</label>
              <Textarea placeholder="Complete business address with pincode" rows={2} value={formData.businessAddress} onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })} />
              {errors.businessAddress && <p className="text-sm text-destructive mt-2">{errors.businessAddress}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Select Plan *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              >
                <option value="">Choose a plan</option>
                <option value="basic">Basic - ₹2,999</option>
                <option value="standard">Standard - ₹4,999 (Most Popular)</option>
                <option value="premium">Premium - ₹9,999</option>
              </select>
              {errors.plan && <p className="text-sm text-destructive mt-2">{errors.plan}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Additional Information</label>
              <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Any specific requirements or questions..." rows={3} />
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
                  onClick={() => router.push(`/login?redirect=/services/gst-registration`)}
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
