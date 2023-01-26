const bigPromise = require('../middlewares/bigpromise');
const customError = require('../utils/customError');
const Product = require('../models/product');
const cloudinary = require('cloudinary');
const whereClause = require('../utils/whereClause');


exports.addProduct = bigPromise(async (req, res, next) => {
    let imageArray = [];

    if(!req.files)
        return next(new customError('Images are required!!', 401));
    
    if(req.files)
    {
        for(let index=0 ; index < req.files.photos.length ; index++)
        {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products",
                width:250,
                height:250,
                crop:"scale"
            });

            imageArray.push({
                id:  result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success:true,
        product
    });
});

exports.getAllProduct = bigPromise(async (req, res, next) => {

    const resultPerPage = 6;
    const totalCountProduct = await Product.countDocuments();

    const productsObj = new whereClause(Product.find(), req.query).search().filter();

    let products = await productsObj.base;

    const filteredProductNumber = products.length;

    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();
    
    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        totalCountProduct
    });
});


exports.adminGetAllProduct = bigPromise(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success:true,
        products
    })

})

exports.getSingleProduct = bigPromise(async (req, res, next) => {

    console.log(req.params.id);
    const product = await Product.findById(req.params.id);

    if(!product)
        return next(new customError('No product was founded!!', 401));
    
    res.status(200).json({
        success:true,
        product
    })

})

exports.updateSingleProduct = bigPromise(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product)
        return next(new customError('No product was founded!!', 401));
    
    let imgArray = [];
    if(req.files)
    {
        //*Destroy the existing images
        for (let index = 0; index < product.photos.length; index++) 
            await cloudinary.v2.uploader.destroy(product.photos[index].id);
        
        //*Uploading the images
        for (let index = 0; index < req.files.photos.length; index++) 
        {
            let item = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products",
                width:250,
                height:250,
                crop:"scale"
            });

            imgArray.push({
                id: item.public_id,
                secure_url: item.secure_url
            })
        }
    }

    product = await Product.findByIdAndUpdate(
    req.params.id, 
    {
        photos: imgArray
    }, 
    {
        new: true,
        runValidators:true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    });
});

exports.deleteSingleProduct = bigPromise(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product)
        return next(new customError('No product was founded!!', 401));
    
    for (let index = 0; index < product.photos.length; index++) 
        await cloudinary.v2.uploader.destroy(product.photos[index].id);

    await product.remove();

    res.status(200).json({
        success: true,
        mesasge: 'Product was deleted!!'
    });
});

exports.addReview = bigPromise(async (req, res, next) => {

    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const AlreadyReview = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if(AlreadyReview)
    {
        product.reviews.forEach(reviewed => {
            if(reviewed.user.toString() === req.user._id.toString())
            {
                reviewed.comment = comment;
                reviewed.rating = rating;
            }
        })
    }
    else
    {
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
    }

    //* adjust rating

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    });

});

exports.deleteReview = bigPromise(async (req, res, next) => {

    const {productId} = req.body;

    const product = await Product.findById(productId);

    const reviews = product.reviews.filter(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    const numberOfReviews = reviews.length;

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // update the product

    await Product.findByIdAndUpdate(productId, 
    {
        reviews,
        ratings,
        numberOfReviews
    }, 
    {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

})

exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success:true,
        reviews: product.reviews
    })

})

