import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RouteEffects from './components/common/RouteEffects'
import Loader from './components/common/Loader'
import Home from './pages/Home'
import NotFound from './components/common/NotFound'

// (Baaki pages tabhi download hote hain jab visitor unpe jaata hai; admin ka code public site ke saath nahi aata)
const Collections = lazy(() => import('./pages/Collections'))
const CollectionPage = lazy(() => import('./pages/CollectionPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const Contact = lazy(() => import('./pages/Contact'))
const Services = lazy(() => import('./pages/Services'))
const About = lazy(() => import('./pages/About'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const AdminRoot = lazy(() => import('./admin/AdminRoot'))
const RequireAdmin = lazy(() => import('./admin/RequireAdmin'))
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'))
const Dashboard = lazy(() => import('./admin/pages/Dashboard'))
const LeadsPage = lazy(() => import('./admin/pages/LeadsPage'))
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'))
const ProductFormPage = lazy(() => import('./admin/pages/ProductFormPage'))
const AdminCollections = lazy(() => import('./admin/pages/AdminCollections'))
const AdminCategories = lazy(() => import('./admin/pages/AdminCategories'))
const AdminNotFound = lazy(() => import('./admin/pages/AdminNotFound'))

function App() {
  return (
    <>
      <RouteEffects />
      <Suspense fallback={<Loader fullPage />}>
      <Routes>
        {/* Admin panel: public site ke Navbar/Footer se alag */}
        <Route path="/admin" element={<AdminRoot />}>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>

        {/* Public website */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:collectionSlug" element={<CollectionPage />} />
          <Route path="/collections/:collectionSlug/:categorySlug" element={<CategoryPage />} />
          <Route
            path="/collections/:collectionSlug/:categorySlug/:productSlug"
            element={<ProductPage />}
          />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}

export default App