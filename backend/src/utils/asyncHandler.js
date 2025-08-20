// Why Do We Need asyncHandler?
// In Express.js, route handlers and middleware can be asynchronous when they involve database queries, API calls, or file operations. Normally, if an error occurs inside an async function, it gets lost unless explicitly caught.

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);  // If the promise is rejected (an error occurs), .catch(next) passes the error to Express's error handler.
  };
};

export {asyncHandler};

// This can also be written as ->

// const asyncHandler = (fn) => async(err,req,res,next) =>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(err){
//         res.status(err.code || 500).json({
//             message: err.message || 'Something has gone wrong!',
//             success: false
//         })
//     }
// }