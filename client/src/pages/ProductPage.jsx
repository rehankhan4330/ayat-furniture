import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MessageCircle, Phone, Ruler } from 'lucide-react'
import { getProduct } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, getWhatsAppLink } from '../config/site'
import Breadcrumbs from '../components/common/Breadcrumbs'
import ImageBox from '../components/common/ImageBox'
import NotFound from '../components/common/NotFound'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import ProductCard from '../components/products/ProductCard'

function ProductDetail({ product }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const { collection, category } = product
  const images = product.images ?? []
  const activeImage = images[activeIndex]
  const related = product.related ?? []

  const dims = product.dimensions ?? {}
  const hasDimensions = [dims.width, dims.depth, dims.height].some((v) => typeof v === 'number')
  const dimText = [dims.width, dims.depth, dims.height].map((v) => (typeof v === 'number' ? v : '-')).join(' x ')

  const whatsappMessage = `Hello, I want to enquire about ${product.name}. ${window.location.href}`
  const phoneLink = `tel:${siteConfig.phone.replace(/\s/g, '')}`
  const callbackLink = `/contact-us?product=${product.slug}&name=${encodeURIComponent(product.name)}`

  return (
    <>
      <title>{`${product.name} | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: collection.name, to: `/collections/${collection.slug}` },
            { label: category.name, to: `/collections/${collection.slug}/${category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* Left: image gallery */}
          <div>
            <ImageBox
              src={activeImage?.url}
              alt={activeImage?.alt || product.name}
              className="aspect-[4/3] w-full rounded-3xl"
            />
            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`overflow-hidden rounded-xl border-2 ${
                      i === activeIndex ? 'border-walnut' : 'border-transparent'
                    }`}
                  >
                    <ImageBox src={img.url} alt={img.alt || product.name} className="h-16 w-20" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: product info */}
          <div>
            <p className="text-xs uppercase tracking-wide text-sage">{category.name}</p>
            <h1 className="mt-1 text-3xl font-bold text-walnut md:text-4xl">{product.name}</h1>
            {product.shortDescription && <p className="mt-2 text-ink/70">{product.shortDescription}</p>}

            <p className="mt-5 text-xl font-semibold text-ink">
              {product.priceLabel || 'Price on enquiry'}
            </p>

            {product.customizable && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-terracotta/15 px-4 py-1 text-sm text-terracotta">
                <Ruler size={16} /> Available in custom size and fabric
              </p>
            )}

            {product.description && (
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink/80">
                {product.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={getWhatsAppLink(whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white shadow-md transition hover:brightness-105"
              >
                <MessageCircle size={18} /> Enquire on WhatsApp
              </a>
              <Link
                to={callbackLink}
                className="inline-flex items-center gap-2 rounded-full bg-walnut px-6 py-3 font-medium text-white shadow-md transition hover:brightness-110"
              >
                Request a Callback
              </Link>
              <a
                href={phoneLink}
                className="inline-flex items-center gap-2 rounded-full border border-walnut/40 px-6 py-3 font-medium text-walnut transition hover:bg-beige/50"
              >
                <Phone size={18} /> Call Us
              </a>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-beige/50 p-6">
            <h2 className="text-lg font-semibold text-walnut">Specifications</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {hasDimensions && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Dimensions (W x D x H)</dt>
                  <dd className="text-right text-ink">
                    {dimText} {dims.unit}
                  </dd>
                </div>
              )}
              {product.materials && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Materials</dt>
                  <dd className="text-right text-ink">{product.materials}</dd>
                </div>
              )}
              {(product.specifications ?? []).map((s) => (
                <div key={s.label} className="flex justify-between gap-4">
                  <dt className="text-ink/60">{s.label}</dt>
                  <dd className="text-right text-ink">{s.value}</dd>
                </div>
              ))}
              {!hasDimensions && !product.materials && (product.specifications ?? []).length === 0 && (
                <p className="text-ink/60">Message us for the full specifications.</p>
              )}
            </dl>
          </div>

          <div className="rounded-3xl bg-beige/50 p-6">
            <h2 className="text-lg font-semibold text-walnut">Available Colours</h2>
            {(product.colours ?? []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.colours.map((c) => (
                  <span key={c} className="rounded-full bg-white px-4 py-1 text-sm text-ink shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-ink/60">
              Other colours and fabrics can be arranged. Message us to know more.
            </p>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-walnut">You may also like</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function ProductPage() {
  const { collectionSlug, categorySlug, productSlug } = useParams()
  const { data: product, loading, error } = useAsync(() => getProduct(productSlug), `product:${productSlug}`)

  if (loading) return <Loader fullPage />
  if (error?.status === 404) return <NotFound message="This product does not exist." />
  if (error) return <ErrorState fullPage message={error.message} />

  // (Product us category aur collection ka hona chahiye jo URL mein hai.)
  if (product.collection?.slug !== collectionSlug || product.category?.slug !== categorySlug) {
    return <NotFound message="This product does not exist." />
  }

  return <ProductDetail key={product.slug} product={product} />
}

export default ProductPage