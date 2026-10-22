import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { adminDeleteProduct, adminGetCollections, adminGetProducts, adminUpdateProduct } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import ImageBox from '../../components/common/ImageBox'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'

const selectClass = 'rounded-full border border-beige bg-white px-4 py-2 text-sm text-ink'

function AdminProducts() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('all')
  const [collection, setCollection] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [notice, setNotice] = useState(location.state?.notice ?? '')
  const [problem, setProblem] = useState('')

  const collections = useAsync(adminGetCollections, 'products-filter-collections')
  const { data, loading, error } = useAsync(
    () => adminGetProducts({ search, status, collection, page, limit: 20 }),
    `admin-products:${search}:${status}:${collection}:${page}:${version}`,
  )

  const products = data?.data ?? []
  const pagination = data?.pagination
  const reload = () => setVersion((v) => v + 1)

  const applySearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const toggleActive = async (p) => {
    setNotice('')
    setProblem('')
    try {
      await adminUpdateProduct(p._id, { isActive: !p.isActive })
      setNotice(p.isActive ? `"${p.name}" is now hidden from the website.` : `"${p.name}" is now visible on the website.`)
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const deleteForever = async (p) => {
    const ok = window.confirm(
      `Permanently delete "${p.name}" and its images?\n\nThis cannot be undone and its website link will stop working. If you only want to hide it, use the Hide button instead.`,
    )
    if (!ok) return
    setNotice('')
    setProblem('')
    try {
      await adminDeleteProduct(p._id, true)
      setNotice('Product deleted permanently.')
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-walnut">Products</h1>
          <p className="mt-1 text-sm text-ink/60">{pagination ? `${pagination.total} products` : 'Your furniture catalogue'}</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-2 text-sm font-medium text-white">
          <Plus size={16} /> Add product
        </Link>
      </div>

      <p className="mt-4 rounded-xl bg-beige/60 px-4 py-3 text-xs text-ink/80">
        <strong>Hide</strong> removes a product from the website but keeps its data and link, so old links do not break.
        Use the bin icon only for mistakes, it deletes the product and its images forever.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <form onSubmit={applySearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name"
            className="w-52 rounded-full border border-beige bg-white px-4 py-2 text-sm outline-none focus:border-walnut"
          />
          <button type="submit" aria-label="Search" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-beige text-walnut">
            <Search size={16} />
          </button>
        </form>

        <select
          value={collection}
          onChange={(e) => {
            setCollection(e.target.value)
            setPage(1)
          }}
          aria-label="Filter by collection"
          className={selectClass}
        >
          <option value="">All collections</option>
          {(collections.data ?? []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          aria-label="Filter by status"
          className={selectClass}
        >
          <option value="all">All products</option>
          <option value="active">Visible only</option>
          <option value="inactive">Hidden only</option>
        </select>
      </div>

      {notice && <p className="mt-4 rounded-xl bg-sage/20 px-4 py-3 text-sm text-ink">{notice}</p>}
      {problem && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{problem}</p>}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {data && products.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink/60">No products match these filters.</p>
      )}

      {products.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {products.map((p) => (
                <tr key={p._id} className={p.isActive ? '' : 'bg-ink/5'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ImageBox src={p.images?.[0]?.url} alt={p.name} className="h-12 w-16 rounded-lg" width={160} />
                      <div>
                        <p className="flex items-center gap-1 font-medium text-ink">
                          {p.name}
                          {p.featured && <Star size={14} className="fill-terracotta text-terracotta" aria-label="Featured" />}
                        </p>
                        <p className="text-xs text-ink/50">{p.images?.length ?? 0} images</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    <p>{p.category?.name}</p>
                    <p className="text-xs text-ink/50">{p.collection?.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.isActive ? 'bg-sage/25 text-ink' : 'bg-ink/10 text-ink/60'}`}>
                      {p.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {p.isActive && p.collection && p.category && (
                        <Link
                          to={`/collections/${p.collection.slug}/${p.category.slug}/${p.slug}`}
                          target="_blank"
                          aria-label={`View ${p.name} on website`}
                          className="text-ink/40 hover:text-walnut"
                        >
                          <ExternalLink size={17} />
                        </Link>
                      )}
                      <Link to={`/admin/products/${p._id}/edit`} aria-label={`Edit ${p.name}`} className="text-walnut hover:opacity-70">
                        <Pencil size={17} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        aria-label={p.isActive ? `Hide ${p.name}` : `Show ${p.name}`}
                        title={p.isActive ? 'Hide from website' : 'Show on website'}
                        className="text-ink/50 hover:text-walnut"
                      >
                        {p.isActive ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                      <button type="button" onClick={() => deleteForever(p)} aria-label={`Delete ${p.name} permanently`} className="text-ink/40 hover:text-red-600">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full bg-white px-4 py-2 shadow-sm disabled:opacity-40">
            Previous
          </button>
          <span className="text-ink/70">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-full bg-white px-4 py-2 shadow-sm disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminProducts