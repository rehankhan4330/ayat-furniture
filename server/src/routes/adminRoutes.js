import { Router } from 'express'
import { login, logout, me } from '../controllers/authController.js'
import {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../controllers/adminCollectionController.js'
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminCategoryController.js'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/adminProductController.js'
import {
  listLeads,
  getLeadStats,
  exportLeads,
  updateLeadStatus,
  deleteLead,
} from '../controllers/adminLeadController.js'
import { uploadImages, removeImage } from '../controllers/uploadController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// ---- Public (login ke liye) ----
router.post('/login', loginLimiter, login)
router.post('/logout', logout)

// ---- Yahan se neeche sab kuch sirf logged-in admin ke liye ----
router.use(requireAdmin)

router.get('/me', me)

router.get('/collections', listCollections)
router.post('/collections', createCollection)
router.get('/collections/:id', getCollection)
router.put('/collections/:id', updateCollection)
router.delete('/collections/:id', deleteCollection)

router.get('/categories', listCategories)
router.post('/categories', createCategory)
router.get('/categories/:id', getCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/products', listProducts)
router.post('/products', createProduct)
router.get('/products/:id', getProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

router.get('/leads', listLeads)
router.get('/leads/stats', getLeadStats)
router.get('/leads/export', exportLeads)
router.patch('/leads/:id', updateLeadStatus)
router.delete('/leads/:id', deleteLead)

router.post('/upload', upload.array('images', 8), uploadImages)
router.delete('/upload', removeImage)

export default router