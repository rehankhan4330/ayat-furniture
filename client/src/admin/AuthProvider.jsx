import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminLogin, adminLogout, adminMe } from '../services/api'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)

  // (Page khulte hi dekho ki login cookie abhi valid hai ya nahi.)
  useEffect(() => {
    let cancelled = false
    adminMe()
      .then((data) => {
        if (!cancelled) setAdmin(data)
      })
      .catch(() => {
        if (!cancelled) setAdmin(null)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password)
    setAdmin(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await adminLogout()
    } finally {
      setAdmin(null)
    }
  }, [])

  const value = useMemo(() => ({ admin, checking, login, logout }), [admin, checking, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}