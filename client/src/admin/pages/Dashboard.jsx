import { Link } from 'react-router-dom'
import { adminGetLeads, adminLeadStats } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'

const statusStyles = {
  new: 'bg-terracotta/15 text-terracotta',
  contacted: 'bg-sage/25 text-ink',
  closed: 'bg-ink/10 text-ink/70',
}

const formatDate = (value) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

function StatCard({ label, value, highlight = false }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${highlight ? 'bg-terracotta text-white' : 'bg-white'}`}>
      <p className={`text-sm ${highlight ? 'text-white/85' : 'text-ink/60'}`}>{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}

function Dashboard() {
  const stats = useAsync(adminLeadStats, 'admin-stats')
  const recent = useAsync(() => adminGetLeads({ limit: 5 }), 'admin-recent')

  return (
    <div>
      <h1 className="text-2xl font-bold text-walnut">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">A quick look at your enquiries.</p>

      {stats.loading && <Loader />}
      {stats.error && <ErrorState message={stats.error.message} />}

      {stats.data && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="New leads" value={stats.data.new} highlight={stats.data.new > 0} />
          <StatCard label="Contacted" value={stats.data.contacted} />
          <StatCard label="Closed" value={stats.data.closed} />
          <StatCard label="Last 7 days" value={stats.data.last7Days} />
          <StatCard label="All leads" value={stats.data.total} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-walnut">Latest enquiries</h2>
        <Link to="/admin/leads" className="text-sm text-walnut hover:underline">
          View all leads
        </Link>
      </div>

      {recent.loading && <Loader />}
      {recent.error && <ErrorState message={recent.error.message} />}

      {recent.data && recent.data.data.length === 0 && (
        <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-ink/60">
          No enquiries yet. They will appear here as soon as someone fills the form.
        </p>
      )}

      {recent.data && recent.data.data.length > 0 && (
        <ul className="mt-4 divide-y divide-beige overflow-hidden rounded-2xl bg-white shadow-sm">
          {recent.data.data.map((lead) => (
            <li key={lead._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {lead.name} <span className="font-normal text-ink/60">({lead.phone})</span>
                </p>
                <p className="truncate text-sm text-ink/60">
                  {lead.product ? `${lead.product.name} - ` : ''}
                  {lead.message}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-ink/50">{formatDate(lead.createdAt)}</span>
                <span className={`rounded-full px-3 py-1 font-medium ${statusStyles[lead.status]}`}>
                  {lead.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dashboard