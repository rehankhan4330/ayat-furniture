import { Link } from 'react-router-dom'
import { collections, getCategoriesByCollection } from '../data/mockData'
import { siteConfig } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'
import ImageBox from '../components/common/ImageBox'

function Collections() {
  return (
    <>
      <title>{`Products | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Products' }]} />
        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">Our Collections</h1>
        <p className="mt-2 text-ink/70">Browse furniture by room.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {collections.map((c) => (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_rgba(107,66,47,0.1)] transition hover:-translate-y-1"
            >
              <ImageBox src={c.image} alt={c.name} className="h-48 w-full" width={600} />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-walnut">{c.name}</h2>
                <p className="mt-1 text-sm text-ink/70">{c.tagline}</p>
                <p className="mt-3 text-xs text-sage">
                  {getCategoriesByCollection(c.slug).length} categories
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

export default Collections