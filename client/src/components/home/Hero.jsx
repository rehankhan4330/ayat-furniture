import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '../../config/site'

function Hero() {
  return (
    <section className="relative isolate flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-walnut via-terracotta to-sage">
      {/* (Asli <img> taaki browser isse sabse pehle load kare; phone ko chhoti 800px wali image milti hai) */}
      <picture>
        <source
          type="image/webp"
          srcSet="/images/hero-800.webp 800w, /images/hero-1600.webp 1600w"
          sizes="100vw"
        />
        <img
          src="/images/hero-1600.jpg"
          srcSet="/images/hero-800.jpg 800w, /images/hero-1600.jpg 1600w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/75 to-ink/25" />
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-6xl">
          Modern Sofas and Furniture, Made for Your Home
        </h1>
        <p className="mt-5 max-w-lg text-lg text-white/85">
          Stylish, comfortable and custom-made furniture for your home and office.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-medium text-walnut shadow-lg transition hover:bg-cream"
          >
            Browse Products <ArrowRight size={18} />
          </Link>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/15 px-7 py-3 font-medium text-white backdrop-blur-md transition hover:bg-white/25"
          >
            <MessageCircle size={18} /> Enquire on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero