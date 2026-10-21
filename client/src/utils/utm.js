const KEY = 'ayat_utm'
const clean = (v, max) => (v || '').trim().slice(0, max)

// (Site khulte hi ek baar chalta hai. Link mein utm nahi hai toh purani value wahi rehti hai.)
export function captureUtm() {
  try {
    const p = new URLSearchParams(window.location.search)
    const utm = {
      source: clean(p.get('utm_source'), 100),
      medium: clean(p.get('utm_medium'), 100),
      campaign: clean(p.get('utm_campaign'), 150),
    }
    if (utm.source || utm.medium || utm.campaign) {
      sessionStorage.setItem(KEY, JSON.stringify(utm))
    }
  } catch {
    // (Private mode mein storage band ho sakta hai, koi dikkat nahi.)
  }
}

export function getUtm() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || undefined
  } catch {
    return undefined
  }
}