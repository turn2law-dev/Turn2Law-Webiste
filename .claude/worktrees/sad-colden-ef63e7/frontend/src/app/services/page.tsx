"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, FileCheck, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const servicesData = [
  {
    category: "Company Formation",
    description: "Register and establish your business with expert guidance",
    icon: Building2,
    services: [
      {
        name: "Partnership Firm",
        href: "/services/partnership",
        description: "Traditional partnership structure for collaborative businesses",
      },
      {
        name: "Private Limited Company",
        href: "/services/private-limited",
        description: "Limited liability protection with separate legal entity status",
      },
      {
        name: "One Person Company",
        href: "/services/opc",
        description: "Single-owner company structure with limited liability",
      },
      {
        name: "Limited Liability Partnership",
        href: "/services/llp",
        description: "Hybrid structure combining partnership flexibility with limited liability",
      },
    ],
  },
  {
    category: "Registrations & Licenses",
    description: "Essential registrations and compliance for your business",
    icon: FileCheck,
    services: [
      {
        name: "GST Registration",
        href: "/services/gst-registration",
        description: "Register for Goods and Services Tax compliance",
      },
      {
        name: "Annual GST Return Filing",
        href: "/services/gst-return-filing",
        description: "Professional assistance with annual GST return submissions",
      },
      {
        name: "Export Import Code",
        href: "/services/iec",
        description: "Obtain IEC for international trade operations",
      },
    ],
  },
];

const features = [
  "Expert legal consultation",
  "Fast turnaround time",
  "Transparent pricing",
  "End-to-end support",
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-gray-500/5 dark:via-transparent dark:to-gray-500/10 pointer-events-none" />
        
        {/* Decorative Elements */}
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary/10 dark:bg-gray-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 dark:bg-gray-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Professional Legal
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary dark:from-gray-300 dark:via-gray-400 dark:to-gray-300 bg-clip-text text-transparent">
                Services You Trust
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Comprehensive business formation and compliance services tailored to your needs.
              Navigate legal complexities with confidence.
            </p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Button asChild size="lg" className="rounded-full bg-[#DF9C49] hover:bg-[#DF9C49]/90 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                <Link href="/consult">Get Started</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full bg-[#17726E] hover:bg-[#17726E]/90 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                <Link href="#services">Browse Services</Link>
              </Button>
            </motion.div>
            
            {/* Features Grid */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + 0.1 * index, duration: 0.3 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 dark:hover:border-gray-400/30 transition-colors"
                >
                  <CheckCircle className="h-5 w-5 text-primary dark:text-gray-400" />
                  <span className="font-medium text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Sections */}
      <section id="services" className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl space-y-20">
          {servicesData.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="pt-10 mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-gray-500/20 dark:to-gray-500/10 border border-primary/20 dark:border-gray-400/20">
                    <category.icon className="h-7 w-7 text-primary dark:text-gray-300" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {category.category}
                  </h2>
                </div>
                <p className="text-muted-foreground text-lg ml-[76px]">
                  {category.description}
                </p>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.services.map((service, serviceIndex) => (
                  <motion.div
                    key={service.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: serviceIndex * 0.1, duration: 0.4 }}
                  >
                    <Link href={service.href}>
                      <div className="group h-full p-7 rounded-2xl border border-border/50 bg-card hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-gray-400/20 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary dark:group-hover:text-gray-300 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground mb-5 leading-relaxed text-[15px]">
                          {service.description}
                        </p>
                        <div className="flex items-center text-primary dark:text-gray-400 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Learn more</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-gray-500/10 dark:via-gray-500/5 dark:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb,120,113,255),0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(107,114,128,0.1),transparent_50%)]" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Need Expert Guidance?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Our team of legal professionals is ready to help you navigate the complexities of business formation and compliance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-[#DF9C49] hover:bg-[#DF9C49]/90 text-white font-semibold px-8 py-6 text-base">
                <Link href="/consult">Consult a Lawyer</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full bg-[#17726E] hover:bg-[#17726E]/90 text-white font-semibold px-8 py-6 text-base">
                <Link href="/lawgpt">Try LawGPT</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
