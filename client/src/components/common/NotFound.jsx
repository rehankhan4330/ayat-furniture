import { Link } from 'react-router-dom'

function NotFound({ message = 'We could not find what you were looking for.' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
      <h1 className="text-3xl font-bold text-walnut">Page not found</h1>
      <p className="mt-2 text-ink/70">{message}</p>
      <Link to="/" className="mt-6 rounded-full bg-walnut px-6 py-2 text-white">
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound