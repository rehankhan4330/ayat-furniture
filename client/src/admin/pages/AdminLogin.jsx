import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AlertCircle, Loader2, Lock } from 'lucide-react'
import { siteConfig } from '../../config/site'
import FormField from '../../components/forms/FormField'
import { useAuth } from '../useAuth'

function AdminLogin() {
  const { admin, checking, login } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  // (Pehle se logged in hai toh seedha dashboard.)
  if (!checking && admin) {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    if (!values.email.trim() || !values.password) {
      setError('Please enter your email and password.')
      return
    }
    setSending(true)
    setError('')
    try {
      await login(values.email.trim(), values.password)
    } catch (err) {
      setError(err.message)
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <title>{`Admin Login | ${siteConfig.name}`}</title>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_8px_24px_rgba(107,66,47,0.12)]">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-walnut text-white">
            <Lock size={22} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-walnut">Admin Login</h1>
          <p className="mt-1 text-sm text-ink/60">{siteConfig.name}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            autoComplete="username"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-walnut px-6 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Logging in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin