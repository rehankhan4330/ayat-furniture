import { MessageCircle, Phone } from 'lucide-react'
import { siteConfig, getWhatsAppLink } from '../../config/site'

function EnquiryStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-3xl bg-walnut px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl">Looking for the right furniture?</h2>
        <p className="mt-2 text-white/80">Message us for designs, sizes and pricing.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 font-medium text-white"
          >
            <MessageCircle size={18} /> WhatsApp Us
          </a>
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/50 px-7 py-3 font-medium text-white"
          >
            <Phone size={18} /> Call Us
          </a>
        </div>
      </div>
    </section>
  )
}

export default EnquiryStrip