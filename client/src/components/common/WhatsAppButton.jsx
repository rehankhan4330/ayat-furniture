import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '../../config/site'

function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition motion-safe:hover:scale-105"
    >
      <MessageCircle size={28} />
    </a>
  )
}

export default WhatsAppButton