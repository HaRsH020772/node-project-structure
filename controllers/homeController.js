const bigPromise = require('../middlewares/bigpromise');

//? 1-Method to avoid the errors using promise
exports.home = bigPromise(async (req, res) => {
    res.status(200).json({
        success:true,
        greeting:"Hello from the API routes!!"
    });
});

//? 2-Method to avoid the errors using try catch and async await
exports.homeDummy = async (req, res) => {
    try
    {
        res.status(200).json({
            success:true,
            greeting:"This is a another dummy route!!"
        });
    }
    catch(err)
    {
        console.log(err);
    }
}