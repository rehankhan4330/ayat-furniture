import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, Inbox, Layers, LayoutDashboard, LogOut, Package, Tags } from 'lucide-react'
import { siteConfig } from '../config/site'
import { useAuth } from './useAuth'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/collections', label: 'Collections', icon: Layers },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
]

function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <title>{`Admin | ${siteConfig.name}`}</title>

      <aside className="bg-walnut text-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col">
        <div className="px-5 py-4">
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-xs text-white/70">Admin panel</p>
        </div>

        <nav className="flex flex-wrap gap-1 px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  isActive ? 'bg-white/20 font-medium' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/15 px-3 py-3 text-sm">
          <p className="truncate px-3 text-xs text-white/70">{admin?.email}</p>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/80 hover:bg-white/10"
          >
            <ExternalLink size={16} /> View website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-white/80 hover:bg-white/10"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout