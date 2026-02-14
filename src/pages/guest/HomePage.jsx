import HeroSection from '../../components/HeroSection'
import FeaturesSection from '../../components/FeaturesSection'
import CTASection from '../../components/CTASection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  )
}
