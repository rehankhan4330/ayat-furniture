import { Sofa } from 'lucide-react'

function ImageBox({ src, alt, className = '' }) {
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
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
}

export default ImageBox