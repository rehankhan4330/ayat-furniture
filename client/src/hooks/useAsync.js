import { useEffect, useState } from 'react'

// (fetcher ek function hai jo promise deta hai. key badalte hi dobara fetch hota hai.)
export function useAsync(fetcher, key) {
  const [result, setResult] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key, data: null, error })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loading = result.key !== key
  return {
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    loading,
  }
}