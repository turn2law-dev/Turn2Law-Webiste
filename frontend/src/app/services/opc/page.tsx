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
import { LoginNudgeDialog } from "@/components/auth/LoginNudgeDialog";
import { useNotification } from '@/contexts/notification-context';
import {
  CheckCircle,
  FileText,
  Shield,
  TrendingUp,
  ArrowRight,
  Building2,
  User,
  Award,
} from "lucide-react";

export default function OPCPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
    businessActivity: "",
    nomineeName: "",
    address: "",
    plan: "",
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedServiceId, setSubmittedServiceId] = useState("");
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { user: currentUser } = await checkServiceAuth();
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          name: currentUser.user_metadata?.full_name || "",
          email: currentUser.email || "",
          phone: currentUser.user_metadata?.phone || "",
        }));
      } else {
        // Delay nudge slightly for smoother entry
        setTimeout(() => setShowLoginNudge(true), 500);
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

    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";

    if (!formData.businessActivity.trim()) newErrors.businessActivity = "Business activity is required";

    if (!formData.nomineeName.trim()) newErrors.nomineeName = "Nominee name is required";

    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.plan) newErrors.plan = "Please select a plan";

    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginNudge(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: ServiceSubmission = {
        serviceType: 'One Person Company (OPC) Registration',
        userId: user.id,
        userEmail: user.email!,
        userName: formData.name,
        userPhone: formData.phone,
        plan: formData.plan, // Assuming formData.plan is the selectedPlan
        formData: {
          businessName: formData.companyName, // Assuming companyName maps to businessName
          businessActivity: formData.businessActivity,
          // pan: formData.pan, // pan is not in current formData state
          address: formData.address,
          message: formData.message
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

      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-gray-700/10 text-primary dark:text-gray-400 text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                Company Formation
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                One Person Company (OPC) Registration
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Perfect for solo entrepreneurs! Register your OPC with limited liability protection and run your business independently with complete control.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-700/90" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Register Your OPC
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">₹12,999</div>
                  <div className="text-sm text-muted-foreground">Starting From</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">1 Person</div>
                  <div className="text-sm text-muted-foreground">Solo Entrepreneur</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                {[
                  { icon: User, title: "Single Ownership", desc: "Only one person required to start" },
                  { icon: Shield, title: "Limited Liability", desc: "Personal assets are protected" },
                  { icon: Award, title: "Separate Legal Entity", desc: "Company has its own identity" },
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
                price: "₹12,999",
                features: ["DSC for Director", "DIN for Director", "Name Approval", "MOA & AOA", "Incorporation", "PAN & TAN"]
              },
              {
                name: "STANDARD",
                price: "₹17,999",
                popular: true,
                features: ["Everything in Basic", "Bank Account", "GST Registration", "Share Certificate", "Priority Support"]
              },
              {
                name: "PREMIUM",
                price: "₹24,999",
                features: ["Everything in Standard", "MSME Registration", "Trademark Filing", "Tax Consultation", "Account Manager"]
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
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">OPC Registration Process</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "DSC & DIN", desc: "Obtain Digital Signature & DIN" },
              { step: "02", title: "Name Approval", desc: "Reserve company name" },
              { step: "03", title: "File SPICe", desc: "Submit incorporation form" },
              { step: "04", title: "Verification", desc: "ROC verifies documents" },
              { step: "05", title: "Certificate", desc: "Receive incorporation certificate" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-primary/20 dark:text-gray-400/20 mb-2">{item.step}</div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {idx < 4 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 w-5 h-5 text-primary dark:text-gray-400" />
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
              { title: "PAN Card", desc: "Of Director & Nominee" },
              { title: "Aadhaar Card", desc: "Of Director & Nominee" },
              { title: "Address Proof", desc: "Utility Bill/Rent Agreement" },
              { title: "Photographs", desc: "Passport size photos" },
              { title: "Bank Statement", desc: "Latest 3 months" },
              { title: "Rent Agreement", desc: "For registered office" },
              { title: "NOC from Owner", desc: "If office is rented" },
              { title: "Utility Bills", desc: "Electricity/Water bill" },
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
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Benefits of OPC Registration</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: User, title: "Single Ownership", desc: "100% control and ownership with just one person required to start" },
              { icon: Shield, title: "Limited Liability", desc: "Personal assets are protected from business liabilities" },
              { icon: Award, title: "Separate Legal Entity", desc: "Company has its own legal identity independent of the owner" },
              { icon: TrendingUp, title: "Easy Funding", desc: "Better access to bank loans and investors compared to proprietorship" },
              { icon: CheckCircle, title: "Perpetual Succession", desc: "Company continues even if the owner changes" },
              { icon: FileText, title: "Brand Recognition", desc: "Enhanced credibility and trust in the market" },
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
              { q: "Who can register an OPC?", a: "Only an Indian citizen and resident can incorporate an OPC. A natural person cannot incorporate more than one OPC or be a nominee in more than one OPC." },
              { q: "What is the minimum capital required for OPC?", a: "There is no minimum capital requirement for OPC. You can start with any amount of capital." },
              { q: "Can an OPC be converted to a Private Limited Company?", a: "Yes, an OPC can be converted into a Private Limited Company or any other type of company as per the Companies Act." },
              { q: "What is a nominee in OPC?", a: "A nominee is a person who will take over the company in case something happens to the sole director. It's mandatory to appoint a nominee." },
              { q: "What are the compliance requirements for OPC?", a: "OPC must file annual returns, financial statements, and conduct at least one board meeting every six months." },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Register Your OPC Today</h2>
            <p className="text-muted-foreground">Fill out the form and our experts will contact you within 24 hours</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name (Director) *</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Proposed Company Name *</label>
                <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="ABC OPC Private Limited" />
                {errors.companyName && <p className="text-sm text-destructive mt-2">{errors.companyName}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Business Activity *</label>
                <Input placeholder="E.g., Consulting, Trading, IT Services" value={formData.businessActivity} onChange={(e) => setFormData({ ...formData, businessActivity: e.target.value })} />
                {errors.businessActivity && <p className="text-sm text-destructive mt-2">{errors.businessActivity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nominee Name *</label>
                <Input placeholder="Name of the nominee director" value={formData.nomineeName} onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })} />
                {errors.nomineeName && <p className="text-sm text-destructive mt-2">{errors.nomineeName}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Registered Office Address *</label>
              <Textarea placeholder="Complete address with pincode" rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              {errors.address && <p className="text-sm text-destructive mt-2">{errors.address}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Select Plan *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              >
                <option value="">Choose a plan</option>
                <option value="basic">Basic - ₹12,999</option>
                <option value="standard">Standard - ₹17,999 (Most Popular)</option>
                <option value="premium">Premium - ₹24,999</option>
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
                  onClick={() => router.push(`/login?redirect=/services/opc`)}
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

      <LoginNudgeDialog
        open={showLoginNudge}
        onOpenChange={setShowLoginNudge}
        redirectPath="/services/opc"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
