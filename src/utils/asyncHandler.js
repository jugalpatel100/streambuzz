const asyncHandler = (requestHandler) => {
  //higher order function -> returns a function wrapped in a promise-then-catch block
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// const asyncHandler = (requestHandler) => {
//     async (req, res, next) => {
//         try {
//             await requestHandler(req, res, next)
//         } catch (error) {
//             res.status(err.code || 500).json({
//                  success: false,
//                  message: err.message     
//             })
//         }
//     }
// }


export { asyncHandler };
