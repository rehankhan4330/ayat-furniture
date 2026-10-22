import { Link, useParams } from 'react-router-dom'
import { getCollection, getProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'
import ImageBox from '../components/common/ImageBox'
import ProductCard from '../components/products/ProductCard'
import NotFound from '../components/common/NotFound'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'

function CollectionPage() {
  const { collectionSlug } = useParams()

  const meta = useAsync(() => getCollection(collectionSlug), `col:${collectionSlug}`)
  const featured = useAsync(
    () => getProducts({ collection: collectionSlug, featured: 'true', limit: 8 }),
    `colfeat:${collectionSlug}`,
  )

  if (meta.loading) return <Loader fullPage />
  if (meta.error?.status === 404) return <NotFound message="This collection does not exist." />
  if (meta.error) return <ErrorState fullPage message={meta.error.message} />

  const collection = meta.data
  const featuredProducts = featured.data?.data ?? []

  return (
    <>
      <title>{`${collection.name} | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/collections' },
            { label: collection.name },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">{collection.name}</h1>
        <p className="mt-2 max-w-xl text-ink/70">{collection.tagline}</p>

        <h2 className="mt-12 text-xl font-semibold text-walnut">Categories</h2>
        {collection.categories.length === 0 ? (
          <p className="mt-4 text-ink/70">No categories here yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {collection.categories.map((c) => (
              <Link
                key={c.slug}
                to={`/collections/${collectionSlug}/${c.slug}`}
                className="rounded-2xl bg-white p-3 shadow-[0_6px_16px_rgba(107,66,47,0.1)] transition hover:-translate-y-1"
              >
                <ImageBox src={c.image?.url} alt={c.name} className="h-28 w-full rounded-xl" width={400} />
                <p className="mt-3 font-medium text-ink">{c.name}</p>
                <p className="mt-1 text-xs text-ink/60">{c.description}</p>
              </Link>
            ))}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <>
            <h2 className="mt-14 text-xl font-semibold text-walnut">Featured in {collection.name}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default CollectionPage