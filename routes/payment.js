const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/user');
const {sendStripeKey, sendRazorpayKey, captureStripePayment, captureRazorpayPayment} = require('../controllers/paymentController');

router.route('/stripekey').get(isLoggedIn, sendStripeKey)
router.route('/razorpaykey').get(isLoggedIn, sendRazorpayKey)


router.route('/stripe-payment').post(isLoggedIn, captureStripePayment);
router.route('/razorpay-payment').post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
