const express = require('express');
const router = express.Router();

// password : 123456

const {signup, login, logout, forgotPassword, passwordReset, getLoggedInUserDetails, changePassword, updateUserDetails, adminAllUser, managerAllUser, adminGetOneUser, adminUpdateSingleUserDetails, adminDeleteSingleUser} = require('../controllers/userController');
// Midddleware function
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').get(login);
router.route('/logout').get(logout);
router.route('/forgot-password').get(forgotPassword);// Setting of the forgot token takes place and a email was sent to the user
router.route('/password/reset/:token').post(passwordReset);// setting of the password takes place, a email was sended to the registered email id

// ? This route was using the middleware
// todo : To use this route there must be token present in the cookie as token
router.route('/userdashboard').get(isLoggedIn,getLoggedInUserDetails);

// todo : This was accessed by the only user who is already logged in bcoz it contains a middleware in its route
router.route('/password/update').post(isLoggedIn, changePassword);

router.route('/userdashboard/update').put(isLoggedIn,updateUserDetails);



// ? Admin route
//* customRole middleware can only be used after isLogedIn middleware as it rerquires the user object details
router.route('/admin/users').get(isLoggedIn, customRole('admin'),adminAllUser);

// ? Manager route
router.route('/manager/users').get(isLoggedIn, customRole('manager'),managerAllUser);

// ? Admin route
router.route('/admin/single-user/:id').get(isLoggedIn, customRole('admin'),adminGetOneUser);

// ? Admin route
router.route('/admin/single-user-update/:id').put(isLoggedIn, customRole('admin'),adminUpdateSingleUserDetails);

// ? Admin route
router.route('/admin/single-user-delete/:id').delete(isLoggedIn, customRole('admin'),adminDeleteSingleUser);


module.exports = router;