function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  as = 'input',
  required = false,
  placeholder = '',
  rows = 4,
  autoComplete,
}) {
  const id = `field-${name}`
  const Tag = as
  const extraProps = as === 'textarea' ? { rows } : { type }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </label>
      <Tag
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition focus:border-walnut ${
          error ? 'border-red-400' : 'border-beige'
        }`}
        {...extraProps}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField