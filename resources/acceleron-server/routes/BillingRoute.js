let router = new ACCELERONCORE._routes.BaseRouter();
let BillingController = require("../controllers/BillingController");

router.post("/generate-bill/", async function (req, res, next) {
  try {
    const data = await new BillingController(req).generateBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

// router.post("/post", async function (req, res, next) {
//   try {
//     const data = await new BillingController(req).postBill();
//     return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
//   } catch (error) {
//     return next(error);
//   }
// });

module.exports = router;