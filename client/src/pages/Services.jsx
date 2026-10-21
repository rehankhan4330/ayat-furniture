import { Link } from 'react-router-dom'
import { Building2, Hammer, MessageCircle, Ruler, Utensils } from 'lucide-react'
import { siteConfig, getWhatsAppLink } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'

// (Ye list client se confirm karni hai. Jo wo nahi karta, yahan se hata dena.)
const serviceList = [
  {
    icon: Ruler,
    title: 'Custom Furniture',
    text: 'Sofas, beds, wardrobes and more, made to your size, design and fabric.',
  },
  {
    icon: Utensils,
    title: 'Modular Kitchens',
    text: 'Kitchen cabinets and storage units planned around your space.',
  },
  {
    icon: Building2,
    title: 'Bulk & Interior Projects',
    text: 'Furniture for homes, offices, showrooms and other projects.',
  },
  {
    icon: Hammer,
    title: 'Repair & Reupholstery',
    text: 'Give your old sofa and chairs a fresh new look.',
  },
]

function Services() {
  return (
    <>
      <title>{`Services | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Services' }]} />
        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">Our Services</h1>
        <p className="mt-2 max-w-xl text-ink/70">
          Beyond ready designs, we can build furniture around your needs.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {serviceList.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-4 rounded-3xl bg-beige/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(107,66,47,0.1)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
                <Icon size={24} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-walnut">{title}</h2>
                <p className="mt-1 text-sm text-ink/75">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-walnut px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">Have a requirement in mind?</h2>
          <p className="mt-2 text-white/80">Tell us about it and we will get back to you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={getWhatsAppLink('Hello, I want to discuss a custom furniture requirement.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 font-medium text-white"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-7 py-3 font-medium text-white"
            >
              Request a Callback
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Services