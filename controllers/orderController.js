const Order = require('../models/order');
const Product = require('../models/product');
const bigPromise = require('../middlewares/bigpromise');
const customError = require('../utils/customError');
const order = require('../models/order');


exports.createOrder = bigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order
    });

});

exports.getOneOrder = bigPromise(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate('user', "name email role");

    if(!order)
        return next(new customError('Order not found!!', 401));
    



    res.status(200).json({
        success: true,
        order,
    });
});


exports.getLoggedInOrder = bigPromise(async (req, res, next) => {

    const order = await Order.find({user: req.user._id});

    if(!order)
        return next(new customError('Order not found!!', 401));
    
    res.status(200).json({
        success: true,
        order,
    });
});

exports.adminGetAllOrders = bigPromise(async (req, res, next) => {

    const orders = await Order.find();
    
    res.status(200).json({
        success: true,
        orders,
    });
});

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {

    const order = await Order.findById(req.params.id);
    
    if(order.orderStatus === 'Delivered')
        return next(new customError('Order is already marked for delivered!!'));

    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async product => {

        await updateProductStock(product.product, product.quantity);

    });

    await order.save();

    res.status(200).json({
        success: true,
        order,
    });
});

async function updateProductStock(productId, quantity)
{
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    await product.save({
        validateBeforeSave: false
    });
}

exports.adminDeleteOrder = bigPromise(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    await order.remove();

    res.status(200).json({
        success: true
    });
});
