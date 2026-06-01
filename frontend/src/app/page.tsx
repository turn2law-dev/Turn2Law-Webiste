import Footer from '@/components/layout/footer';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import ThreePillarsSection from '@/components/sections/three-pillars';
import KnowAboutUs from '@/components/sections/know-about-us';
import ContactForm from '@/components/sections/contact-form';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <Hero />
        <ThreePillarsSection />
<About />
        <KnowAboutUs />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
