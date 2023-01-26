const User = require('../models/user');
const bigPromise = require('../middlewares/bigpromise');
const customError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');

exports.signup = bigPromise(async (req,res,next) => {

    if(!req.files)
        return next(new customError('photo is required for the sign-up page!!',400));
    
    const {name, email, password} = req.body;

    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder:"users",
        width:150,
        crop:"scale"
    });
    
    if(!email || !name || !password)
        return next(new customError('Name, email and password are required!!',400));
    
    //await is required here bcoz it takes time to create a document.
    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id:result.public_id,
            secure_url: result.secure_url
        }
    });

    cookieToken(user, res);
});

exports.login = bigPromise(async (req, res, next) => {
    const {email, password} = req.body;

    //Check the presence of the above fields
    if(!email || !password)
        return next(new customError('Please provide email and password!!', 400));
    
    //get user from the DB
    const user = await User.findOne({email}).select("+password");

    if(!user)
        return next(new customError('you are not registered to site!!', 400));
    
    // isValidatePassword method present in model user.
    const isPasswordCorrect = await user.isValidatePassword(password);

    if(!isPasswordCorrect)
        return next(new customError('Email or password does not match!!', 400));

    cookieToken(user, res);
})

exports.logout = bigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success:true,
        message: 'Logout successfull!!'
    });
});

exports.forgotPassword = bigPromise(async (req, res, next) => {
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user)
        return next(new customError('Email not found as registered!!', 400));

    const forgotToken = await user.getForgotPasswordToken();
    //As we are updating few fields before saving so we have to false the flag validateBeforeSave.
    await user.save(
        {
            validateBeforeSave: false
        });

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    try
    {
        //Intiate the email helper function written in utils to send the email
        await mailHelper({
            email: user.email,
            subject: "E-comm password - reset email",
            message
        });

        res.status(200).json({
            success:true,
            message:"Email was send succesfully!!"
        });
    }
    catch(err)
    {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save(
            {
                validateBeforeSave: false
            });
        return next(new customError(err.message, 500));
    }
})

exports.passwordReset = bigPromise(async (req, res, next) => {
    const token = req.params.token;
    const encryptToken = await crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

    const user = await User.findOne(
        {
            forgotPasswordToken: encryptToken,
            forgotPasswordExpiry: {$gt:Date.now()}
        });
    if(!user)
        return next(new customError('Token is invalid or is expired!!',404));
    
    // now start the process of setting the pasword
    if(req.body.password !== req.body.confirmPassword)
        return next(new customError('password and confirm password are not same please check once!!',400));
    
    user.password = req.body.password;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();
    cookieToken(user, res);
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    });
});

exports.changePassword = bigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');

    const IsCorrectOldPassword = await user.isValidatePassword(req.body.oldPassword);

    if(!IsCorrectOldPassword)
        return next(new customError('Old password is incorrect!!', 400));
    
    user.password = req.body.password;
    await user.save();

    cookieToken(user, res);
})

exports.updateUserDetails = bigPromise(async (req, res, next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
    };

    if(req.files.photo !== '')
    {
        const user = await User.findById({_id: req.user.id});
        const imageId = user.photo.id;

        //Delete the old pic
        const response = await cloudinary.v2.uploader.destroy(imageId);

        //Update a new pic
        let file = req.files.photo;
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder:"users",
            width:150,
            crop:"scale"
        });

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success:true,
        user
    });
});

//* Used by Admin only
exports.adminAllUser =  bigPromise(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
})

exports.managerAllUser =  bigPromise(async (req, res, next) => {
    const users = await User.find({role:'user'});

    res.status(200).json({
        success: true,
        users
    });
});

exports.adminGetOneUser = bigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user)
        next(new customError('No user exists with this id!!', 400));

    res.status(200).json({
        success:true,
        user
    });
});

exports.adminUpdateSingleUserDetails = bigPromise(async (req, res, next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success:true,
        user
    });
})

exports.adminDeleteSingleUser = bigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user)
        next(new customError('No user exists with this id!!', 400));
    
    const imageId = user.photo.id;
    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success:true,
    });
})
