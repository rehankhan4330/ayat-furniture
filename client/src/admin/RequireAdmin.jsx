import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import AdminLayout from './AdminLayout'
import Loader from '../components/common/Loader'

function RequireAdmin() {
  const { admin, checking } = useAuth()
  const location = useLocation()

  if (checking) return <Loader fullPage label="Checking login..." />
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  return <AdminLayout />
}

export default RequireAdmin