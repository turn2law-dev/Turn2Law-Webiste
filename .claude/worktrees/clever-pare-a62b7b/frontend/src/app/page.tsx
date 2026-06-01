import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import ThreePillarsSection from '@/components/sections/three-pillars';
import KnowAboutUs from '@/components/sections/know-about-us';
import ContactForm from '@/components/sections/contact-form';
import KnowledgeGraph from '@/components/ui/knowledge-graph';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ThreePillarsSection />
        <KnowledgeGraph />
        <About />
        <KnowAboutUs />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
