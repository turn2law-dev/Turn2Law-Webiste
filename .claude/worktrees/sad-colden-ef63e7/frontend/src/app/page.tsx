import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import ThreePillarsSection from '@/components/sections/three-pillars';
import Banner from '@/components/sections/banner';
import KnowAboutUs from '@/components/sections/know-about-us';
import ContactForm from '@/components/sections/contact-form';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <ThreePillarsSection />
        <Banner />
        <KnowAboutUs />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
