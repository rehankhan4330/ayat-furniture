import { services } from '../../data/mockData'

function ServicesHighlights() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20">
      <h2 className="text-2xl font-bold text-walnut md:text-3xl">Our Services</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl bg-beige/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(107,66,47,0.1)]"
          >
            <h3 className="font-semibold text-walnut">{s.title}</h3>
            <p className="mt-2 text-sm text-ink/70">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesHighlights