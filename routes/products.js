import express from 'express'
import { ProductController } from '../controllers/products.js';

const router = express.Router();

router.route('/').get(ProductController.getProducts)
router.route('/static').get(ProductController.getAllProductsStatic);
router.route('/:id').get(ProductController.getSingleProduct);

export default router;