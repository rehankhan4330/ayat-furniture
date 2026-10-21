import Breadcrumbs from '../common/Breadcrumbs'
import { siteConfig } from '../../config/site'

function LegalLayout({ title, updated, intro, sections }) {
  return (
    <>
      <title>{`${title} | ${siteConfig.name}`}</title>
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
        <h1 className="mt-4 text-3xl font-bold text-walnut md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: {updated}</p>
        <p className="mt-6 text-ink/80">{intro}</p>

        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold text-walnut">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-ink/75">{s.text}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

export default LegalLayout