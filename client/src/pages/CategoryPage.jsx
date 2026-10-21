import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { getCollection, getProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, getWhatsAppLink } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'
import NotFound from '../components/common/NotFound'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import ProductCard from '../components/products/ProductCard'

const PAGE_SIZE = 12

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]

function CategoryPage() {
  const { collectionSlug, categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSort = searchParams.get('sort')
  const sort = sortOptions.some((o) => o.value === rawSort) ? rawSort : 'newest'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const meta = useAsync(() => getCollection(collectionSlug), `col:${collectionSlug}`)
  const list = useAsync(
    () => getProducts({ collection: collectionSlug, category: categorySlug, sort, page, limit: PAGE_SIZE }),
    `products:${collectionSlug}:${categorySlug}:${sort}:${page}`,
  )

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setSearchParams(next)
  }

  if (meta.loading) return <Loader fullPage />
  if (meta.error?.status === 404) return <NotFound message="This category does not exist." />
  if (meta.error) return <ErrorState fullPage message={meta.error.message} />

  const collection = meta.data
  const category = collection.categories.find((c) => c.slug === categorySlug)
  if (!category) return <NotFound message="This category does not exist." />

  const products = list.data?.data ?? []
  const pagination = list.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  return (
    <>
      <title>{`${category.name} | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/collections' },
            { label: collection.name, to: `/collections/${collectionSlug}` },
            { label: category.name },
          ]}
        />

        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">{category.name}</h1>
        <p className="mt-2 max-w-xl text-ink/70">{category.description}</p>

        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {/* Sidebar: same collection ki saari categories */}
          <aside className="md:col-span-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              {collection.name}
            </h2>
            <ul className="space-y-1">
              {collection.categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/collections/${collectionSlug}/${c.slug}`}
                    className={`block rounded-xl px-3 py-2 text-sm transition ${
                      c.slug === categorySlug
                        ? 'bg-beige font-medium text-walnut'
                        : 'text-ink/75 hover:bg-beige/50'
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <section className="md:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink/70">
                {list.data ? `${total} ${total === 1 ? 'product' : 'products'}` : ' '}
              </p>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value, page: '' })}
                  className="rounded-full border border-beige bg-white px-4 py-2 text-ink"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {list.loading && <Loader />}
            {list.error && <ErrorState message={list.error.message} />}

            {list.data && total === 0 && (
              <div className="mt-10 rounded-3xl bg-beige/50 p-10 text-center">
                <p className="text-lg font-medium text-walnut">No products here yet.</p>
                <p className="mt-2 text-sm text-ink/70">
                  Message us and we will share the latest designs.
                </p>
                <a
                  href={getWhatsAppLink(`Hello, I want to see ${category.name} designs.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-sage px-6 py-2 text-white"
                >
                  <MessageCircle size={18} /> Enquire on WhatsApp
                </a>
              </div>
            )}

            {list.data && total > 0 && products.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-ink/70">There are no products on this page.</p>
                <button
                  type="button"
                  onClick={() => updateParams({ page: '' })}
                  className="mt-4 rounded-full bg-walnut px-6 py-2 text-white"
                >
                  Go to first page
                </button>
              </div>
            )}

            {products.length > 0 && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateParams({ page: n === 1 ? '' : String(n) })}
                    aria-current={n === page ? 'page' : undefined}
                    className={`h-10 w-10 rounded-full text-sm transition ${
                      n === page ? 'bg-walnut text-white' : 'bg-white text-ink hover:bg-beige'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </nav>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

export default CategoryPage