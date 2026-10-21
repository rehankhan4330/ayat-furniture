import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.to ? (
              <Link to={item.to} className="hover:text-walnut">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink" aria-current="page">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight size={14} />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs