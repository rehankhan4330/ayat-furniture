import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetCategories,
  adminGetCollections,
  adminUpdateCategory,
} from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import FormField from '../../components/forms/FormField'
import ImageBox from '../../components/common/ImageBox'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormAlert from '../components/FormAlert'
import ImageUploader from '../components/ImageUploader'

function CategoryForm({ initial, collections, defaultCollectionId, onSaved, onCancel }) {
  const editing = Boolean(initial?._id)
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    collectionId: initial?.collectionId ?? defaultCollectionId ?? '',
    description: initial?.description ?? '',
    displayOrder: initial?.displayOrder ?? 0,
    isActive: initial?.isActive ?? true,
    image: initial?.image?.url
      ? { url: initial.image.url, publicId: initial.image.publicId || '' }
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

    const found = {}
    if (values.name.trim().length < 2) found.name = 'Please enter a name.'
    if (!values.collectionId) found.collectionId = 'Please choose a collection.'
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    const payload = {
      name: values.name.trim(),
      collectionId: values.collectionId,
      description: values.description.trim(),
      displayOrder: Math.max(0, Math.trunc(Number(values.displayOrder) || 0)),
      isActive: values.isActive,
      image: values.image ?? { url: '', publicId: '' },
    }
    if (values.slug.trim()) payload.slug = values.slug.trim()

    setSaving(true)
    setAlert('')
    setServerErrors(null)
    try {
      if (editing) await adminUpdateCategory(initial._id, payload)
      else await adminCreateCategory(payload)
      onSaved(editing ? 'Category updated.' : 'Category added.')
    } catch (err) {
      setAlert(err.message)
      setServerErrors(err.errors || null)
      setErrors(err.errors || {})
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-walnut">{editing ? 'Edit category' : 'Add category'}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="field-collectionId" className="text-sm font-medium text-ink">
            Collection <span className="text-terracotta">*</span>
          </label>
          <select
            id="field-collectionId"
            name="collectionId"
            value={values.collectionId}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-walnut ${
              errors.collectionId ? 'border-red-400' : 'border-beige'
            }`}
          >
            <option value="">Choose a collection</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.collectionId && <p className="mt-1 text-sm text-red-600">{errors.collectionId}</p>}
        </div>
        <FormField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} required placeholder="e.g. Stationary Sofas" />
      </div>

      <div>
        <FormField label="Slug (page link)" name="slug" value={values.slug} onChange={handleChange} error={errors.slug} placeholder="stationary-sofas" />
        <p className="mt-1 text-xs text-ink/50">
          {editing ? 'Changing this changes the category link on the website.' : 'Leave empty to create it from the name.'}
        </p>
      </div>

      <FormField label="Description" name="description" as="textarea" rows={2} value={values.description} onChange={handleChange} error={errors.description} />

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
        <p className="mb-2 text-sm font-medium text-ink">Category image</p>
        <ImageUploader
          images={values.image ? [values.image] : []}
          onChange={(arr) =>
            setValues((prev) => ({
              ...prev,
              image: arr[0] ? { url: arr[0].url, publicId: arr[0].publicId } : null,
            }))
          }
          max={1}
          showAlt={false}
        />
      </div>

      <FormAlert message={alert} errors={serverErrors} />

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-walnut px-6 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-walnut/40 px-6 py-2 text-sm text-walnut">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AdminCategories() {
  const [version, setVersion] = useState(0)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | category
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState('')

  const collections = useAsync(adminGetCollections, `cat-collections:${version}`)
  const { data, loading, error } = useAsync(
    () => adminGetCategories({ collectionId: filter }),
    `admin-categories:${filter}:${version}`,
  )
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
      await adminUpdateCategory(c._id, { isActive: !c.isActive })
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const remove = async (c) => {
    if (!window.confirm(`Delete the category "${c.name}"?`)) return
    setNotice('')
    setProblem('')
    try {
      await adminDeleteCategory(c._id)
      setNotice('Category deleted.')
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const noCollections = collections.data && collections.data.length === 0

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-walnut">Categories</h1>
          <p className="mt-1 text-sm text-ink/60">Types of furniture inside a collection, like Sofas or Beds.</p>
        </div>
        {!editing && collections.data && !noCollections && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} /> Add category
          </button>
        )}
      </div>

      {noCollections && (
        <p className="mt-4 rounded-xl bg-beige/60 px-4 py-3 text-sm text-ink">
          Please add a collection first. Categories live inside collections.
        </p>
      )}

      {notice && <p className="mt-4 rounded-xl bg-sage/20 px-4 py-3 text-sm text-ink">{notice}</p>}
      {problem && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{problem}</p>}

      {editing && collections.data && (
        <CategoryForm
          key={editing === 'new' ? 'new' : editing._id}
          initial={editing === 'new' ? null : editing}
          collections={collections.data}
          defaultCollectionId={filter}
          onSaved={saved}
          onCancel={() => setEditing(null)}
        />
      )}

      {collections.data && collections.data.length > 0 && (
        <div className="mt-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by collection"
            className="rounded-full border border-beige bg-white px-4 py-2 text-sm text-ink"
          >
            <option value="">All collections</option>
            {collections.data.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {data && data.length === 0 && !noCollections && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink/60">No categories here yet.</p>
      )}

      {data && data.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Collection</th>
                <th className="px-4 py-3">Products</th>
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
                      <ImageBox src={c.image?.url} alt={c.name} className="h-10 w-14 rounded-lg" width={160} />
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-ink/50">/{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{c.collection?.name}</td>
                  <td className="px-4 py-3 text-ink/70">{c.productCount}</td>
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
        A category can only be deleted when it has no products. Otherwise, set it to Hidden.
      </p>
    </div>
  )
}

export default AdminCategories