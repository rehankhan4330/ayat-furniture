import { Outlet } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'

function AdminRoot() {
  return (
    <AuthProvider>
      <meta name="robots" content="noindex, nofollow" />
      <Outlet />
    </AuthProvider>
  )
}

export default AdminRoot