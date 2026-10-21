import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent, trackPageView } from '../../utils/tracking'

function RouteEffects() {
  const { pathname } = useLocation()

  // (Naye page par hamesha upar se shuru, aur ek PageView.)
  useEffect(() => {
    window.scrollTo(0, 0)
    trackPageView()
  }, [pathname])

  // (Site ke saare WhatsApp aur call links ek hi jagah se pakde jate hain.)
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href]')
      if (!link) return
      const href = link.getAttribute('href') || ''
      if (href.startsWith('https://wa.me/')) trackEvent('Contact', { method: 'whatsapp' })
      else if (href.startsWith('tel:')) trackEvent('Contact', { method: 'phone' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}

export default RouteEffects