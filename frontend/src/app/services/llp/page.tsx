"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { checkServiceAuth, submitServiceRequest } from "@/lib/service-requests";
import { useNotification } from '@/contexts/notification-context';
import {
  CheckCircle,
  FileText,
  Shield,
  TrendingUp,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  Users,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { SuccessDialog } from "@/components/service-tracking/SuccessDialog";

export default function LLPPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    llpName: "",
    businessActivity: "",
    address: "",
    numberOfPartners: "",
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
      const { user: authUser, profile, isAuthenticated } = await checkServiceAuth();
      if (isAuthenticated) {
        setUser({ ...authUser, ...profile });
        setFormData(prev => ({
          ...prev,
          name: profile?.full_name || "",
          email: authUser.email || "",
          phone: profile?.phone || "",
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

    if (!formData.llpName.trim()) newErrors.llpName = "Proposed LLP name is required";

    const partners = Number(formData.numberOfPartners);
    if (!partners || partners < 2) newErrors.numberOfPartners = "Minimum 2 partners required";

    if (!formData.businessActivity.trim()) newErrors.businessActivity = "Business activity is required";

    if (!formData.address.trim()) newErrors.address = "Registered office address is required";

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
        router.push(`/login?redirect=/services/llp`);
      }, 2000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const result = await submitServiceRequest({
      userId: user.id,
      userEmail: formData.email,
      userName: formData.name,
      userPhone: formData.phone,
      serviceType: 'LLP',
      plan: formData.plan || 'basic',
      formData: {
        llpName: formData.llpName,
        numberOfPartners: formData.numberOfPartners,
        businessActivity: formData.businessActivity,
        address: formData.address,
        message: formData.message,
      },
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmittedServiceId(result.serviceRequest?.service_number);
      setShowSuccess(true);
    } else {
      showNotification(result.error || 'Service request failed', 'error');
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
                Limited Liability Partnership (LLP) Registration
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Combine the benefits of partnership and company! Get limited liability protection with flexible partnership structure and minimal compliance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-700/90" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Register Your LLP
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">₹11,999</div>
                  <div className="text-sm text-muted-foreground">Starting From</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary dark:text-gray-400">Min 2</div>
                  <div className="text-sm text-muted-foreground">Partners Required</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                {[
                  { icon: Shield, title: "Limited Liability", desc: "Partners' personal assets protected" },
                  { icon: Users, title: "Flexible Structure", desc: "Easy to manage with partner agreement" },
                  { icon: Briefcase, title: "Separate Legal Entity", desc: "LLP has its own identity" },
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
                price: "₹11,999",
                features: ["DSC for 2 Partners", "DIN for Designated Partners", "Name Approval", "LLP Agreement", "LLP Registration", "PAN & TAN"]
              },
              {
                name: "STANDARD",
                price: "₹16,999",
                popular: true,
                features: ["Everything in Basic", "Bank Account Assistance", "GST Registration", "Certificate of Incorporation", "Priority Support"]
              },
              {
                name: "PREMIUM",
                price: "₹23,999",
                features: ["Everything in Standard", "MSME Registration", "Trademark Filing", "Legal Consultation", "Dedicated Manager"]
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
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">LLP Registration Process</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "DSC Application", desc: "Apply for Digital Signature Certificate" },
              { step: "02", title: "DIN Allocation", desc: "Get Director Identification Number" },
              { step: "03", title: "Name Approval", desc: "Reserve your LLP name" },
              { step: "04", title: "File Incorporation", desc: "Submit incorporation documents" },
              { step: "05", title: "LLP Incorporated", desc: "Receive LLP certificate" },
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
              { title: "PAN Card", desc: "Of all Designated Partners" },
              { title: "Aadhaar Card", desc: "Of all Designated Partners" },
              { title: "Address Proof", desc: "Registered office address proof" },
              { title: "Photographs", desc: "Passport size photos of partners" },
              { title: "Rent Agreement", desc: "If office is rented" },
              { title: "NOC from Owner", desc: "For registered office" },
              { title: "Bank Statement", desc: "Latest 3 months" },
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
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose LLP?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Limited Liability", desc: "Partners' personal assets are protected from business liabilities and debts" },
              { icon: Users, title: "Flexible Management", desc: "No mandatory board meetings or resolutions, easy to manage with partner agreement" },
              { icon: Briefcase, title: "Separate Legal Entity", desc: "LLP has its own legal identity independent of its partners" },
              { icon: TrendingUp, title: "Easy Compliance", desc: "Lower compliance requirements compared to private limited companies" },
              { icon: CheckCircle, title: "No Minimum Capital", desc: "No minimum capital requirement to start an LLP" },
              { icon: FileCheck, title: "Perpetual Succession", desc: "LLP continues to exist even if partners change" },
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
              { q: "What is the minimum number of partners required for LLP?", a: "A minimum of 2 partners are required to form an LLP. There is no maximum limit on the number of partners." },
              { q: "Can a foreign national be a partner in an Indian LLP?", a: "Yes, foreign nationals and foreign companies can be partners in an Indian LLP with prior approval from RBI." },
              { q: "What is the difference between LLP and Partnership Firm?", a: "LLP provides limited liability protection and is a separate legal entity, while partnership firms have unlimited liability and are not separate legal entities." },
              { q: "Is audit mandatory for LLP?", a: "Audit is mandatory only if annual turnover exceeds ₹40 lakhs or contribution exceeds ₹25 lakhs." },
              { q: "Can an LLP be converted to a Private Limited Company?", a: "Yes, an LLP can be converted into a Private Limited Company as per the provisions of the Companies Act." },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Register Your LLP Today</h2>
            <p className="text-muted-foreground">Fill out the form and our experts will contact you within 24 hours</p>
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
                <label className="block text-sm font-medium text-foreground mb-2">Number of Partners *</label>
                <Input type="number" min="2" value={formData.numberOfPartners} onChange={(e) => setFormData({ ...formData, numberOfPartners: e.target.value })} placeholder="2" />
                {errors.numberOfPartners && <p className="text-sm text-destructive mt-2">{errors.numberOfPartners}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Proposed LLP Name *</label>
                <Input value={formData.llpName} onChange={(e) => setFormData({ ...formData, llpName: e.target.value })} placeholder="ABC LLP" />
                {errors.llpName && <p className="text-sm text-destructive mt-2">{errors.llpName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Business Activity *</label>
                <Input placeholder="E.g., Consulting, Trading, Manufacturing" value={formData.businessActivity} onChange={(e) => setFormData({ ...formData, businessActivity: e.target.value })} />
                {errors.businessActivity && <p className="text-sm text-destructive mt-2">{errors.businessActivity}</p>}
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
                <option value="basic">Basic - ₹11,999</option>
                <option value="standard">Standard - ₹16,999 (Most Popular)</option>
                <option value="premium">Premium - ₹23,999</option>
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
                  onClick={() => router.push(`/login?redirect=/services/llp`)}
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
