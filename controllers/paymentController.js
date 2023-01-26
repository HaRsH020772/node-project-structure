const bigPromise = require('../middlewares/bigpromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = bigPromise(async (req, res, next) => {

    res.status(200).json({
        stripeKey: process.env.STRIPE_API_KEY // safe to provide
    });
});

exports.captureStripePayment = bigPromise(async (req, res, next) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        //* optional
        metadata: { integration_check: 'accept_a_payment' }
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        // we can send the id as well
    })
})

exports.sendRazorpayKey = bigPromise(async (req, res, next) => {

    res.status(200).json({
        razorpayKey: process.env.RAZORPAY_API_KEY
    });
});

exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {

    var instance = new Razorpay(
        {
             key_id: process.env.RAZORPAY_API_KEY, 
             key_secret: process.env.RAZORPAY_SECRET 
        });
    
    var options = {
        amount: req.body.amount,
        currency: "INR"
    };

    const myOrder = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    });
})


