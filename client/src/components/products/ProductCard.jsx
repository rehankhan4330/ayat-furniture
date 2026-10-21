import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '../../config/site'
import { productPath, mainImage } from '../../utils/paths'
import ImageBox from '../common/ImageBox'

function ProductCard({ product }) {
  const path = productPath(product)
  const image = mainImage(product)
  const message = `Hello, I want to enquire about ${product.name}. ${window.location.origin}${path}`

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(107,66,47,0.1)]">
      <Link to={path}>
        <ImageBox
          src={image?.url}
          alt={image?.alt || product.name}
          className="aspect-[4/3] w-full"
        />
      </Link>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-sage">{product.category?.name}</p>
        <Link to={path}>
          <h3 className="mt-1 font-semibold text-ink hover:text-walnut">{product.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-ink/60">{product.priceLabel || 'Price on enquiry'}</p>
        <a
          href={getWhatsAppLink(message)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          <MessageCircle size={16} /> Enquire on WhatsApp
        </a>
      </div>
    </article>
  )
}

export default ProductCard