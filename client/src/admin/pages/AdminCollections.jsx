import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  adminCreateCollection,
  adminDeleteCollection,
  adminGetCollections,
  adminUpdateCollection,
} from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import FormField from '../../components/forms/FormField'
import ImageBox from '../../components/common/ImageBox'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormAlert from '../components/FormAlert'
import ImageUploader from '../components/ImageUploader'

function CollectionForm({ initial, onSaved, onCancel }) {
  const editing = Boolean(initial?._id)
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    displayOrder: initial?.displayOrder ?? 0,
    isActive: initial?.isActive ?? true,
    banner: initial?.bannerImage?.url
      ? { url: initial.bannerImage.url, publicId: initial.bannerImage.publicId || '' }
      : null,
  })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [serverErrors, setServerErrors] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    if (values.name.trim().length < 2) {
      setErrors({ name: 'Please enter a name.' })
      return
    }

    const payload = {
      name: values.name.trim(),
      tagline: values.tagline.trim(),
      description: values.description.trim(),
      displayOrder: Math.max(0, Math.trunc(Number(values.displayOrder) || 0)),
      isActive: values.isActive,
      bannerImage: values.banner ?? { url: '', publicId: '' },
    }
    if (values.slug.trim()) payload.slug = values.slug.trim()

    setSaving(true)
    setAlert('')
    setServerErrors(null)
    try {
      if (editing) await adminUpdateCollection(initial._id, payload)
      else await adminCreateCollection(payload)
      onSaved(editing ? 'Collection updated.' : 'Collection added.')
    } catch (err) {
      setAlert(err.message)
      setServerErrors(err.errors || null)
      setErrors(err.errors || {})
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-walnut">{editing ? 'Edit collection' : 'Add collection'}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} required placeholder="e.g. Living Room" />
        <div>
          <FormField label="Slug (page link)" name="slug" value={values.slug} onChange={handleChange} error={errors.slug} placeholder="living-room" />
          <p className="mt-1 text-xs text-ink/50">
            {editing
              ? 'Changing this changes the collection link on the website.'
              : 'Leave empty to create it from the name.'}
          </p>
        </div>
      </div>

      <FormField label="Tagline" name="tagline" value={values.tagline} onChange={handleChange} error={errors.tagline} placeholder="One short line shown under the name" />
      <FormField label="Description" name="description" as="textarea" rows={3} value={values.description} onChange={handleChange} error={errors.description} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Display order (smaller shows first)" name="displayOrder" type="number" value={values.displayOrder} onChange={handleChange} error={errors.displayOrder} />
        <label className="flex items-center gap-2 pt-7 text-sm text-ink">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 accent-[#6B422F]"
          />
          Active (visible on the website)
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Banner image</p>
        <ImageUploader
          images={values.banner ? [values.banner] : []}
          onChange={(arr) =>
            setValues((prev) => ({
              ...prev,
              banner: arr[0] ? { url: arr[0].url, publicId: arr[0].publicId } : null,
            }))
          }
          max={1}
          showAlt={false}
        />
      </div>

      <FormAlert message={alert} errors={serverErrors} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-walnut px-6 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-walnut/40 px-6 py-2 text-sm text-walnut">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AdminCollections() {
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState(null) // null | 'new' | collection
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState('')

  const { data, loading, error } = useAsync(adminGetCollections, `admin-collections:${version}`)
  const reload = () => setVersion((v) => v + 1)

  const saved = (message) => {
    setEditing(null)
    setProblem('')
    setNotice(message)
    reload()
  }

  const toggleActive = async (c) => {
    setNotice('')
    setProblem('')
    try {
      await adminUpdateCollection(c._id, { isActive: !c.isActive })
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const remove = async (c) => {
    if (!window.confirm(`Delete the collection "${c.name}"?`)) return
    setNotice('')
    setProblem('')
    try {
      await adminDeleteCollection(c._id)
      setNotice('Collection deleted.')
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-walnut">Collections</h1>
          <p className="mt-1 text-sm text-ink/60">Rooms or sections like Living Room, Bedroom or Dining.</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} /> Add collection
          </button>
        )}
      </div>

      {notice && <p className="mt-4 rounded-xl bg-sage/20 px-4 py-3 text-sm text-ink">{notice}</p>}
      {problem && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{problem}</p>}

      {editing && (
        <CollectionForm
          key={editing === 'new' ? 'new' : editing._id}
          initial={editing === 'new' ? null : editing}
          onSaved={saved}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {data && data.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink/60">No collections yet. Add your first one.</p>
      )}

      {data && data.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Collection</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {data.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ImageBox src={c.bannerImage?.url} alt={c.name} className="h-10 w-14 rounded-lg" width={160} />
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-ink/50">/{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{c.categoryCount}</td>
                  <td className="px-4 py-3 text-ink/70">{c.displayOrder}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        c.isActive ? 'bg-sage/25 text-ink' : 'bg-ink/10 text-ink/60'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`} className="text-walnut hover:opacity-70">
                        <Pencil size={17} />
                      </button>
                      <button type="button" onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className="text-ink/40 hover:text-red-600">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-ink/50">
        A collection can only be deleted when it has no categories. Otherwise, set it to Hidden.
      </p>
    </div>
  )
}

export default AdminCollections