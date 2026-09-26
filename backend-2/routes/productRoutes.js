const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProductById);
router.delete('/:id', productController.deleteProductById);

module.exports = router;
