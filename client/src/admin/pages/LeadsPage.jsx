import { useState } from 'react'
import { Download, MessageCircle, Phone, Search, Trash2 } from 'lucide-react'
import {
  adminDeleteLead,
  adminDownloadLeads,
  adminGetLeads,
  adminUpdateLead,
} from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import { siteConfig } from '../../config/site'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'

const statusStyles = {
  new: 'bg-terracotta/15 text-terracotta',
  contacted: 'bg-sage/25 text-ink',
  closed: 'bg-ink/10 text-ink/70',
}

const formatDate = (value) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const selectClass = 'rounded-full border border-beige bg-white px-4 py-2 text-sm text-ink'

function LeadsPage() {
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  // (Status badalne ya delete karne par poori list dobara load nahi hoti, yahin screen par update ho jata hai.)
  const [overrides, setOverrides] = useState({})
  const [removed, setRemoved] = useState([])
  const [notice, setNotice] = useState('')
  const [downloading, setDownloading] = useState(false)

  const { data, loading, error } = useAsync(
    () => adminGetLeads({ status, type, search, page, limit: 20 }),
    `leads:${status}:${type}:${search}:${page}`,
  )

  const leads = (data?.data ?? []).filter((l) => !removed.includes(l._id))
  const pagination = data?.pagination

  const applySearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const changeStatus = async (lead, next) => {
    setNotice('')
    try {
      await adminUpdateLead(lead._id, next)
      setOverrides((prev) => ({ ...prev, [lead._id]: next }))
    } catch (err) {
      setNotice(err.message)
    }
  }

  const removeLead = async (lead) => {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`)) return
    setNotice('')
    try {
      await adminDeleteLead(lead._id)
      setRemoved((prev) => [...prev, lead._id])
    } catch (err) {
      setNotice(err.message)
    }
  }

  const download = async () => {
    setDownloading(true)
    setNotice('')
    try {
      await adminDownloadLeads({ status, type, search })
    } catch (err) {
      setNotice(err.message)
    } finally {
      setDownloading(false)
    }
  }

  const whatsappLink = (lead) =>
    `https://wa.me/91${lead.phone}?text=${encodeURIComponent(
      `Hello ${lead.name}, thank you for your enquiry at ${siteConfig.name}.`,
    )}`

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-walnut">Leads</h1>
          <p className="mt-1 text-sm text-ink/60">
            {pagination ? `${pagination.total} enquiries` : 'Enquiries from your website'}
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <Download size={16} /> {downloading ? 'Preparing...' : 'Download CSV'}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={applySearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, phone or email"
            className="w-60 rounded-full border border-beige bg-white px-4 py-2 text-sm outline-none focus:border-walnut"
          />
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-beige text-walnut"
          >
            <Search size={16} />
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPage(1)
          }}
          className={selectClass}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          <option value="callback">Callback</option>
          <option value="contact">Contact</option>
        </select>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {notice}
        </p>
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {data && leads.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink/60">
          No enquiries match these filters.
        </p>
      )}

      {leads.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {leads.map((lead) => {
                const current = overrides[lead._id] ?? lead.status
                return (
                  <tr key={lead._id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-ink/70">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{lead.name}</p>
                      <p className="text-ink/70">{lead.phone}</p>
                      {lead.email && <p className="text-xs text-ink/50">{lead.email}</p>}
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`tel:+91${lead.phone}`}
                          aria-label={`Call ${lead.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-beige text-walnut"
                        >
                          <Phone size={15} />
                        </a>
                        <a
                          href={whatsappLink(lead)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`WhatsApp ${lead.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white"
                        >
                          <MessageCircle size={15} />
                        </a>
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-ink/80">
                      <p className="line-clamp-4 whitespace-pre-line">{lead.message}</p>
                      <p className="mt-1 text-xs text-ink/50">{lead.type}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/80">{lead.product?.name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-ink/60">
                      {lead.utm?.campaign || lead.utm?.source ? (
                        <>
                          <p>{lead.utm.campaign || '-'}</p>
                          <p>
                            {lead.utm.source || '-'} / {lead.utm.medium || '-'}
                          </p>
                        </>
                      ) : (
                        <p>Direct</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyles[current]}`}>
                        {current}
                      </span>
                      <select
                        value={current}
                        onChange={(e) => changeStatus(lead, e.target.value)}
                        aria-label={`Change status for ${lead.name}`}
                        className="block rounded-lg border border-beige bg-white px-2 py-1 text-xs"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeLead(lead)}
                        aria-label={`Delete enquiry from ${lead.name}`}
                        className="text-ink/40 transition hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full bg-white px-4 py-2 text-ink shadow-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-ink/70">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full bg-white px-4 py-2 text-ink shadow-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default LeadsPage