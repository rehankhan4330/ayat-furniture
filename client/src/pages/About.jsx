import { Link } from 'react-router-dom'
import { Factory, Ruler, ShieldCheck, Truck } from 'lucide-react'
import { siteConfig } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'

const strengths = [
  { icon: Factory, title: 'Factory Direct', text: 'We make our furniture ourselves, with no middlemen.' },
  { icon: Ruler, title: 'Custom Sizes & Fabrics', text: 'Furniture built to fit your space and taste.' },
  { icon: ShieldCheck, title: 'Quality Materials', text: 'Materials chosen to last for years.' },
  { icon: Truck, title: 'Delivery & Installation', text: 'We bring it home and set it up for you.' },
]

function About() {
  return (
    <>
      <title>{`About Us | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">About {siteConfig.name}</h1>

        {/* (Ye text placeholder hai. Client ki asli kahani aur details yahan daalni hain.) */}
        <div className="mt-6 max-w-3xl space-y-4 text-ink/80">
          <p>
            {siteConfig.name} is a furniture manufacturer making sofas and complete home and
            office furniture. {siteConfig.tagline}.
          </p>
          <p>
            From sofas, recliners and beds to dining sets and office chairs, every piece can be
            made to suit your space, your size and your choice of fabric.
          </p>
        </div>

        <h2 className="mt-14 text-2xl font-bold text-walnut">Why choose us</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {strengths.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-beige/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(107,66,47,0.1)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold text-walnut">{title}</h3>
              <p className="mt-1 text-sm text-ink/70">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/collections"
            className="inline-flex rounded-full bg-walnut px-8 py-3 font-medium text-white shadow-md transition hover:brightness-110"
          >
            Browse Our Products
          </Link>
        </div>
      </div>
    </>
  )
}

export default About