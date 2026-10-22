import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Sofa, Menu, X, MessageCircle } from 'lucide-react'
import { siteConfig, getWhatsAppLink } from '../../config/site'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/collections' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact-us' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  // (Sirf home page ka hero dark image hota hai. Baaki sab pages light hain, wahan navbar shuru se solid.)
  const isHome = pathname === '/'
  const solid = scrolled || !isHome

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const barClass = solid
    ? 'border-beige bg-cream/90 text-ink shadow-lg'
    : 'border-white/30 bg-white/15 text-white shadow-lg'

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      solid
        ? isActive
          ? 'text-walnut'
          : 'text-ink/70 hover:text-walnut'
        : isActive
          ? 'text-white'
          : 'text-white/75 hover:text-white'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-5 py-3 backdrop-blur-md transition-colors duration-300 ${barClass}`}
      >
        <Link to="/" className="flex items-center gap-2">
          <Sofa size={26} className={solid ? 'text-walnut' : ''} />
          <span className="text-lg font-semibold leading-tight">{siteConfig.name}</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            aria-label="Enquire on WhatsApp"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white shadow-md transition hover:brightness-110"
          >
            <MessageCircle size={20} />
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/20 bg-walnut/95 p-4 shadow-lg backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-white/90 hover:bg-white/10"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar