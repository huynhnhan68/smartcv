import '../components/landing/landing.css'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import LogoMarquee from '../components/landing/LogoMarquee'
import FeatureShowcase from '../components/landing/FeatureShowcase'
import HowItWorks from '../components/landing/HowItWorks'
import DeepDive from '../components/landing/DeepDive'
import About from '../components/landing/About'
import FAQ from '../components/landing/FAQ'
import CTABand from '../components/landing/CTABand'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div
      className="land-page relative bg-grid-pattern"
      style={{
        background: '#000',
        color: '#f9fafb',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <Navbar />
      <Hero />
      <LogoMarquee />
      <FeatureShowcase />
      <HowItWorks />
      <DeepDive />
      <About />
      <FAQ />
      <CTABand />
      <Footer />
    </div>
  )
}
