import HeroSection from '../../components/HeroSection'
import FeaturesSection from '../../components/FeaturesSection'
import CTASection from '../../components/CTASection'
import DestinationSection from '../../components/DestinationSection'
import NewsSection from '../../components/NewsSection'
import FAQSection from '../../components/FAQSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DestinationSection />
      <NewsSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}