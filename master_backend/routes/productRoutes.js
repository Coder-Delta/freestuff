const express = require('express');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', protect, authorize('admin', 'moderator'), validateRequest(['name', 'price']), productController.createProduct);
router.put('/:id', protect, authorize('admin', 'moderator'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;
