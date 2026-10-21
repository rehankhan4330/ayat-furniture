import LegalLayout from '../components/layout/LegalLayout'
import { siteConfig } from '../config/site'

const sections = [
  {
    heading: 'About this website',
    text: 'This website is a product catalogue and enquiry platform. You cannot buy products or make payments on this website. Orders are confirmed only after direct discussion with our team.',
  },
  {
    heading: 'Product information',
    text: 'Product images, colours, sizes and specifications are for guidance. Actual products may vary slightly because of fabric, finish, lighting and handcrafting.',
  },
  {
    heading: 'Pricing',
    text: 'Prices are shared on enquiry and may change without notice. A price becomes final only when confirmed by our team in writing or on WhatsApp.',
  },
  {
    heading: 'Custom orders',
    text: 'Custom sizes, fabrics and designs are made after you confirm the final details. Timelines, advance payment and delivery terms will be discussed and agreed before work begins.',
  },
  {
    heading: 'Use of the website',
    text: 'You agree to use this website lawfully and to provide accurate details in your enquiries. Content on this website, including text, images and logos, belongs to the business and may not be copied without permission.',
  },
  {
    heading: 'Limitation of liability',
    text: 'We try to keep the information on this website accurate and up to date, but we do not guarantee that it is free from errors. We are not liable for any loss arising from the use of this website.',
  },
  {
    heading: 'Changes to these terms',
    text: 'We may update these terms from time to time. Continued use of the website means you accept the latest version.',
  },
]

function Terms() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      updated="October 2026"
      intro={`By using the ${siteConfig.name} website, you agree to the terms below.`}
      sections={sections}
    />
  )
}

export default Terms