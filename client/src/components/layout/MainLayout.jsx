import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Loader from '../common/Loader'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from '../common/WhatsAppButton'

function MainLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main>
        <Suspense fallback={<Loader fullPage />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default MainLayout