import { siteConfig } from '../config/site'
import Hero from '../components/home/Hero'
import TrustFeatures from '../components/home/TrustFeatures'
import CategorySelector from '../components/home/CategorySelector'
import FeaturedProducts from '../components/home/FeaturedProducts'
import PromoBanner from '../components/home/PromoBanner'
import ServicesHighlights from '../components/home/ServicesHighlights'
import EnquiryStrip from '../components/home/EnquiryStrip'

function Home() {
  return (
    <>
      <title>{`${siteConfig.name} | ${siteConfig.tagline}`}</title>
      <Hero />
      <TrustFeatures />
      <CategorySelector />
      <FeaturedProducts />
      <PromoBanner />
      <ServicesHighlights />
      <EnquiryStrip />
    </>
  )
}

export default Home