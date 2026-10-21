import { useSearchParams } from 'react-router-dom'
import { MapPin, MessageCircle, Mail, Phone } from 'lucide-react'
import { siteConfig, getWhatsAppLink } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'
import LeadForm from '../components/forms/LeadForm'

function Contact() {
  const [params] = useSearchParams()
  const phoneLink = `tel:${siteConfig.phone.replace(/\s/g, '')}`

  // (?product=slug&name=Product+Name se aata hai. Slug ko sirf safe characters tak rakhte hain.)
  const rawSlug = params.get('product') || ''
  const productSlug = /^[a-z0-9-]{1,120}$/.test(rawSlug) ? rawSlug : undefined
  const productName = (params.get('name') || '').trim().slice(0, 80)
  const defaultMessage = productSlug && productName
    ? `I am interested in ${productName}. Please call me back with details.`
    : ''

  return (
    <>
      <title>{`Contact Us | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />
        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">Contact Us</h1>
        <p className="mt-2 max-w-xl text-ink/70">
          Share your requirement and we will call you back with designs, sizes and pricing.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_24px_rgba(107,66,47,0.1)] md:p-8">
            <h2 className="mb-5 text-xl font-semibold text-walnut">Request a Callback</h2>
            <LeadForm
              key={productSlug || 'general'}
              type={productSlug ? 'callback' : 'contact'}
              productSlug={productSlug}
              defaultMessage={defaultMessage}
            />
          </div>

          <div className="space-y-4">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-2xl bg-[#25D366] p-5 text-white shadow-md transition hover:brightness-105"
            >
              <MessageCircle size={28} />
              <span>
                <span className="block font-semibold">Chat on WhatsApp</span>
                <span className="text-sm text-white/90">Fastest way to get designs and prices</span>
              </span>
            </a>

            <div className="rounded-2xl bg-beige/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-walnut">Reach us directly</h2>
              <ul className="space-y-4 text-sm text-ink/80">
                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-terracotta" />
                  <a href={phoneLink} className="hover:text-walnut">
                    {siteConfig.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-terracotta" />
                  <a href={`mailto:${siteConfig.email}`} className="hover:text-walnut">
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-terracotta" />
                  <span>{siteConfig.address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact