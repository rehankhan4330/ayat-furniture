import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function PromoBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-beige via-cream to-sage/50 p-10 md:p-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-terracotta/20 blur-2xl" />
        <div className="relative max-w-lg">
          <h2 className="text-3xl font-bold text-walnut md:text-4xl">
            Made to Fit Your Space
          </h2>
          <p className="mt-3 text-ink/75">
            Custom sizes, fabrics and finishes. Tell us what you need and we will build it.
          </p>
          <Link
            to="/contact-us"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-walnut px-7 py-3 font-medium text-white shadow-lg transition hover:brightness-110"
          >
            Get in Touch <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PromoBanner