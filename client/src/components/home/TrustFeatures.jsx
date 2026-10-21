import { Factory, Ruler, ShieldCheck, Truck } from 'lucide-react'

const features = [
  { icon: Factory, title: 'Factory Direct', text: 'Made by us, no middlemen' },
  { icon: Ruler, title: 'Custom Sizes & Fabrics', text: 'Built to fit your space' },
  { icon: ShieldCheck, title: 'Quality Materials', text: 'Chosen to last' },
  { icon: Truck, title: 'Delivery & Installation', text: 'Right to your door' },
]

function TrustFeatures() {
  return (
    <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6">
      <div className="grid gap-4 rounded-3xl bg-cream p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-2xl bg-beige/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(107,66,47,0.08)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-ink/65">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TrustFeatures