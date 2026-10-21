import { AlertCircle } from 'lucide-react'

function FormAlert({ message, errors }) {
  if (!message) return null
  const items = errors ? Object.entries(errors) : []

  return (
    <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p>{message}</p>
        {items.length > 0 && (
          <ul className="mt-1 list-disc pl-5">
            {items.map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FormAlert