import { Link } from 'react-router-dom'
import { getCollections } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import ImageBox from '../common/ImageBox'
import ErrorState from '../common/ErrorState'

function CategorySelector() {
  const { data: collections, loading, error } = useAsync(getCollections, 'home-collections')

  return (
    <section className="mx-auto max-w-6xl px-6 pt-20">
      <h2 className="text-2xl font-bold text-walnut md:text-3xl">Shop by Room</h2>

      {error ? (
        <ErrorState message={error.message} />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-beige/60" />
              ))
            : collections.map((c) => (
                <Link
                  key={c.slug}
                  to={`/collections/${c.slug}`}
                  className="rounded-2xl bg-cream p-3 text-center shadow-[0_6px_16px_rgba(107,66,47,0.1)] transition hover:-translate-y-1"
                >
                  <ImageBox src={c.bannerImage?.url} alt={c.name} className="h-28 w-full rounded-xl" />
                  <p className="mt-3 text-sm font-medium text-ink">{c.name}</p>
                </Link>
              ))}
        </div>
      )}
    </section>
  )
}

export default CategorySelector