import { Sofa } from 'lucide-react'

// (Cloudinary URL mein width jodta hai taaki chhote card ko poori 3000px image na download karni pade)
function cloudinaryUrl(src, width) {
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) return src
  const [base, rest] = src.split('/upload/')
  const path = rest.replace(/^f_auto,q_auto\//, '')
  return `${base}/upload/f_auto,q_auto,c_limit,w_${width}/${path}`
}

function ImageBox({ src, alt, className = '', width = 800, priority = false }) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-beige to-sage/40 text-walnut/50 ${className}`}
        aria-label={alt}
      >
        <Sofa size={40} />
      </div>
    )
  }
  return (
    <img
      src={cloudinaryUrl(src, width)}
      srcSet={`${cloudinaryUrl(src, width)} 1x, ${cloudinaryUrl(src, width * 2)} 2x`}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  )
}

export default ImageBox
