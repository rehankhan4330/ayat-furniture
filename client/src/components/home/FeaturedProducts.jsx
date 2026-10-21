import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getProducts } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import ProductCard from '../products/ProductCard'
import ErrorState from '../common/ErrorState'

const fetchFeatured = () => getProducts({ featured: 'true', limit: 8 })

function FeaturedProducts() {
  const { data, loading, error } = useAsync(fetchFeatured, 'home-featured')
  const products = data?.data ?? []

  // (Koi featured product nahi hai toh poora section hi nahi dikhega.)
  if (!loading && !error && products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-6 pt-20">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-walnut md:text-3xl">Featured Products</h2>
        <Link to="/collections" className="inline-flex items-center gap-1 text-sm text-walnut hover:underline">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-beige/60" />
              ))
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </section>
  )
}

export default FeaturedProducts