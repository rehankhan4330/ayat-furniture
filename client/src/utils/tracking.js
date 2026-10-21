const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID
let loaded = false

// (Pehli baar zaroorat padne par hi Meta ki script load hoti hai.)
function ensurePixel() {
  if (loaded) return true
  if (typeof window === 'undefined') return false
  if (!PIXEL_ID || !/^\d{8,20}$/.test(PIXEL_ID)) return false

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments)
      else fbq.queue.push(arguments)
    }
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', PIXEL_ID)
  loaded = true
  return true
}

export function trackEvent(name, params) {
  // (Admin panel ki activity kabhi track nahi hoti.)
  if (window.location.pathname.startsWith('/admin')) return
  if (!ensurePixel()) return
  window.fbq('track', name, params)
}

export const trackPageView = () => trackEvent('PageView')

// (Form submit hone par. Naam, phone ya email yahan se kabhi nahi bheje jate.)
export const trackLead = (params) => trackEvent('Lead', params)