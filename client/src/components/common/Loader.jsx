import { Loader2 } from 'lucide-react'

function Loader({ fullPage = false, label = 'Loading...' }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-walnut ${
        fullPage ? 'min-h-screen pt-24' : 'py-16'
      }`}
      role="status"
    >
      <Loader2 className="animate-spin" size={22} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default Loader