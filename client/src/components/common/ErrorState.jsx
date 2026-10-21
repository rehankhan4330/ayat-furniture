function ErrorState({ message = 'Something went wrong.', fullPage = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${
        fullPage ? 'min-h-screen pt-24' : 'py-16'
      }`}
      role="alert"
    >
      <p className="text-lg font-medium text-walnut">We could not load this right now.</p>
      <p className="mt-1 text-sm text-ink/70">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-5 rounded-full bg-walnut px-6 py-2 text-white transition hover:brightness-110"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorState