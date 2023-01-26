const express = require('express');
const { addProduct, getAllProduct, adminGetAllProduct, getSingleProduct, updateSingleProduct, deleteSingleProduct, addReview, getOnlyReviewsForOneProduct, deleteReview } = require('../controllers/productController');
const router = express.Router();
const { isLoggedIn, customRole } = require('../middlewares/user');

//? user routes
router.route('/products').get(getAllProduct);

router.route('/get-single-product/:id').get(getSingleProduct);

router.route('/admin/product-review/add').put(isLoggedIn, addReview);

router.route('/admin/product-review/delete').delete(isLoggedIn, deleteReview);

router.route('/admin/product-reviews').get(isLoggedIn, getOnlyReviewsForOneProduct);


// ? Admin routes
router.route('/admin/product/add').post(isLoggedIn,customRole('admin'),addProduct);

//? Admin get product route
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProduct);

//? Admin update product route
router.route('/admin/update-product/:id').put(isLoggedIn, customRole('admin'), updateSingleProduct);

//? Admin delete product route
router.route('/admin/delete-product/:id').delete(isLoggedIn, customRole('admin'), deleteSingleProduct);





module.exports = router;
