const express = require('express');
const { createOrder, getOneOrder, getLoggedInOrder, adminGetAllOrders, adminDeleteOrder, adminUpdateOrder } = require('../controllers/orderController');
const router = express.Router();
const { isLoggedIn, customRole } = require('../middlewares/user');


router.route('/order/create').post(isLoggedIn, createOrder);

//* returns a particular order
router.route('/order/single-order/:id').get(isLoggedIn, getOneOrder);

router.route('/myorder').get(isLoggedIn, getLoggedInOrder);

//* Admin route to get all the orders
router.route('/admin/get-orders').get(isLoggedIn,customRole('admin'), adminGetAllOrders);

//* Admin delete the order
router.route('/admin/delete-order/:id').delete(isLoggedIn,customRole('admin'), adminDeleteOrder);

//* Admin update the order
router.route('/admin/update-order/:id').delete(isLoggedIn,customRole('admin'), adminUpdateOrder);


module.exports = router;
