import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { adminDeleteImage, adminUploadImages } from '../../services/api'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PICK_MB = 20 // (tu itni badi file chun sakta hai)
const KEEP_ORIGINAL_BYTES = 1.5 * 1024 * 1024 // (isse chhoti file bina chhede jati hai)
const TARGET_BYTES = 3 * 1024 * 1024 // (badi file chhoti karke isse neeche laate hain)

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))

// (Badi photo ko website ke liye kaafi badi (2400 px) par chhota karta hai. Chhoti photo seedha wapas.)
async function prepareFile(file) {
  if (file.size <= KEEP_ORIGINAL_BYTES) return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`"${file.name}" could not be read. Please try a different photo.`)
  }

  // (JPEG ko JPEG hi rakhte hain. PNG/WebP mein transparency ho sakti hai, unke liye WebP.)
  const isJpeg = file.type === 'image/jpeg'
  const type = isJpeg ? 'image/jpeg' : 'image/webp'
  const ext = isJpeg ? 'jpg' : 'webp'
  const base = file.name.replace(/\.[^.]+$/, '')

  try {
    for (const maxSide of [2400, 1800]) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      for (const quality of [0.88, 0.8, 0.7]) {
        const blob = await toBlob(canvas, type, quality)
        if (blob && blob.type === type && blob.size <= TARGET_BYTES) {
          return new File([blob], `${base}.${ext}`, { type })
        }
      }
    }
  } finally {
    bitmap.close?.()
  }
  throw new Error(`"${file.name}" is too large even after resizing. Please use a smaller photo.`)
}

// images: [{ url, publicId, alt }]   onChange(newImagesArray)
function ImageUploader({ images, onChange, max = 10, showAlt = true }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('') // (khaali = kuch nahi ho raha, warna button par dikhne wala text)
  const [error, setError] = useState('')
  const [fresh, setFresh] = useState([]) // (jo images is form mein abhi upload hui, abhi save nahi hui)

  const busy = status !== ''

  const discardIfFresh = (img) => {
    if (img?.publicId && fresh.includes(img.publicId)) {
      adminDeleteImage(img.publicId).catch(() => {})
      setFresh((prev) => prev.filter((id) => id !== img.publicId))
    }
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setError('')

    if (max === 1 && files.length > 1) return setError('Please choose only one image.')
    if (files.length > 8) return setError('You can upload at most 8 images at a time.')
    if (max > 1 && images.length + files.length > max) {
      return setError(`You can add at most ${max} images.`)
    }
    const wrongType = files.find((f) => !ALLOWED_TYPES.includes(f.type))
    if (wrongType) return setError(`"${wrongType.name}" is not allowed. Use JPG, PNG or WebP.`)
    const tooBig = files.find((f) => f.size > MAX_PICK_MB * 1024 * 1024)
    if (tooBig) return setError(`"${tooBig.name}" is larger than ${MAX_PICK_MB} MB.`)

    try {
      // (Pehle sab chhoti karo, ek ek karke taaki browser ki memory na bhare.)
      const prepared = []
      for (let i = 0; i < files.length; i++) {
        setStatus(files.length > 1 ? `Preparing ${i + 1} of ${files.length}...` : 'Preparing photo...')
        prepared.push(await prepareFile(files[i]))
      }

      // (Phir ek ek karke upload karo. Ek saath bhejne se slow internet par timeout aata hai.)
      const added = []
      let failure = ''
      for (let i = 0; i < prepared.length; i++) {
        setStatus(prepared.length > 1 ? `Uploading ${i + 1} of ${prepared.length}...` : 'Uploading...')
        try {
          const [u] = await adminUploadImages([prepared[i]])
          added.push({ url: u.url, publicId: u.publicId, alt: '' })
        } catch (err) {
          failure = `"${files[i].name}" could not be uploaded: ${err.message}`
          break
        }
      }

      if (added.length > 0) {
        setFresh((prev) => [...prev, ...added.map((a) => a.publicId)])
        if (max === 1) {
          discardIfFresh(images[0])
          onChange(added)
        } else {
          onChange([...images, ...added])
        }
      }
      if (failure) {
        setError(added.length > 0 ? `${failure} The photos before it were added.` : failure)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('')
    }
  }

  const removeAt = (index) => {
    discardIfFresh(images[index])
    onChange(images.filter((_, i) => i !== index))
  }

  const move = (from, to) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  const setAlt = (index, alt) => {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)))
  }

  const canAdd = max === 1 || images.length < max

  return (
    <div>
      {images.length > 0 && (
        <ul className={`grid gap-4 ${max === 1 ? 'max-w-xs' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {images.map((img, i) => (
            <li key={img.publicId || img.url} className="rounded-2xl border border-beige bg-white p-2">
              <div className="relative">
                <img src={img.url} alt={img.alt || 'Preview'} className="aspect-[4/3] w-full rounded-xl object-cover" />
                {i === 0 && max > 1 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-walnut px-2 py-0.5 text-xs text-white">
                    <Star size={12} /> Main
                  </span>
                )}
              </div>

              {showAlt && (
                <input
                  value={img.alt}
                  onChange={(e) => setAlt(i, e.target.value)}
                  maxLength={150}
                  placeholder="Short description (alt text)"
                  aria-label={`Description for image ${i + 1}`}
                  className="mt-2 w-full rounded-lg border border-beige px-2 py-1 text-xs outline-none focus:border-walnut"
                />
              )}

              <div className="mt-2 flex items-center justify-between">
                {max > 1 ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      aria-label="Move image left"
                      className="rounded-full bg-beige p-1.5 text-walnut disabled:opacity-30"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, i + 1)}
                      disabled={i === images.length - 1}
                      aria-label="Move image right"
                      className="rounded-full bg-beige p-1.5 text-walnut disabled:opacity-30"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-red-600"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={max > 1}
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-walnut/50 px-5 py-2 text-sm text-walnut transition hover:bg-beige/50 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {status}
              </>
            ) : (
              <>
                <ImagePlus size={16} /> {images.length > 0 && max === 1 ? 'Replace image' : 'Add images'}
              </>
            )}
          </button>
        </>
      )}

      <p className="mt-2 text-xs text-ink/50">
        JPG, PNG or WebP, up to {MAX_PICK_MB} MB each. Large photos are resized automatically, so the quality stays sharp on the website.
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUploader