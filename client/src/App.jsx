import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RouteEffects from './components/common/RouteEffects'
import Home from './pages/Home'
import Collections from './pages/Collections'
import CollectionPage from './pages/CollectionPage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import Contact from './pages/Contact'
import Services from './pages/Services'
import About from './pages/About'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import NotFound from './components/common/NotFound'
import AdminRoot from './admin/AdminRoot'
import RequireAdmin from './admin/RequireAdmin'
import AdminLogin from './admin/pages/AdminLogin'
import Dashboard from './admin/pages/Dashboard'
import LeadsPage from './admin/pages/LeadsPage'
import AdminProducts from './admin/pages/AdminProducts'
import ProductFormPage from './admin/pages/ProductFormPage'
import AdminCollections from './admin/pages/AdminCollections'
import AdminCategories from './admin/pages/AdminCategories'
import AdminNotFound from './admin/pages/AdminNotFound'

function App() {
  return (
    <>
      <RouteEffects />
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
    </>
  )
}

export default App