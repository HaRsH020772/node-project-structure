//* we can use {try catch} with {async await} or Promises

//todo : Explainaton this exports a function and this functino wil take a function as an arguement named as func and then wraps inside a promise.

module.exports = (func) => (req,res,next) => 
    Promise.resolve(func(req,res,next)).catch(next);

// module.exports = function(func)
// {
//     console.log('Passed from here!!')
//     return function(req,res,next)
//     {
//         return Promise.resolve(func(req,res,next)).catch(next);
//     }
// }