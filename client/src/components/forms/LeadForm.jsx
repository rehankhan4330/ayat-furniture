import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import FormField from './FormField'
import { submitLead } from '../../services/api'
import { getUtm } from '../../utils/utm'
import { trackLead } from '../../utils/tracking'

const emptyValues = { name: '', phone: '', email: '', message: '', website: '' }

// (+91, 91 ya 0 se start hone wale numbers bhi chalenge. Final number 10 digit ka, 6-9 se shuru.)
function cleanPhone(phone) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

function validate(values) {
  const errors = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name.'
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone(values.phone))) {
    errors.phone = 'Please enter a valid 10-digit mobile number.'
  }

  if (values.email.trim() && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (values.message.trim().length < 10) {
    errors.message = 'Please write at least 10 characters.'
  }

  return errors
}

function LeadForm({ type = 'callback', defaultMessage = '', productSlug }) {
  const [values, setValues] = useState({ ...emptyValues, message: defaultMessage })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const found = validate(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setStatus('sending')
    setServerMessage('')
    try {
      await submitLead({
        name: values.name.trim(),
        phone: cleanPhone(values.phone),
        email: values.email.trim(),
        message: values.message.trim(),
        website: values.website, // (honeypot, insaan ke liye hamesha khaali)
        type,
        productSlug,
        sourcePath: window.location.pathname,
        utm: getUtm(),
      })
      trackLead({ content_name: productSlug || 'general', lead_type: type })
      setStatus('success')
      setValues(emptyValues)
    } catch (err) {
      // (Server ne field-wise galti batayi toh wahi fields ke neeche dikhao.)
      if (err.status === 400 && err.errors) {
        setErrors(err.errors)
        setStatus('idle')
        return
      }
      const friendly = err.status === 0 || (err.status >= 400 && err.status < 500) ? err.message : ''
      setServerMessage(friendly)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl bg-sage/20 p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto text-sage" size={44} />
        <h3 className="mt-3 text-xl font-semibold text-walnut">Thank you!</h3>
        <p className="mt-2 text-sm text-ink/75">
          We have received your request and will contact you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-5 rounded-full border border-walnut/40 px-5 py-2 text-sm text-walnut hover:bg-beige/50"
        >
          Send another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField
        label="Your name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        required
        autoComplete="name"
        placeholder="Enter your full name"
      />
      <FormField
        label="Mobile number"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={handleChange}
        error={errors.phone}
        required
        autoComplete="tel"
        placeholder="10-digit mobile number"
      />
      <FormField
        label="Email (optional)"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        placeholder="you@example.com"
      />
      <FormField
        label="Message"
        name="message"
        as="textarea"
        value={values.message}
        onChange={handleChange}
        error={errors.message}
        required
        placeholder="Tell us what you are looking for"
      />

      {/* Honeypot field (hidden from real users) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="field-website">Website</label>
        <input
          id="field-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      {status === 'error' && (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle size={18} className="shrink-0" />
          {serverMessage || 'Something went wrong. Please try again or message us on WhatsApp.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-walnut px-6 py-3 font-medium text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'sending' ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Sending...
          </>
        ) : (
          'Request a Callback'
        )}
      </button>
    </form>
  )
}

export default LeadForm