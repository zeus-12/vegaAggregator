let router = new ACCELERONCORE._routes.BaseRouter();
let OrderController = require("../controllers/OrderController");

router.post("/", async function (req, res, next) {
  try {
    const data = await new OrderController(req).newOrder();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    const data = await new OrderController(req).updateOrderItems();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id/apply-discount", async function (req, res, next) {
  try {
    const data = await new OrderController(req).addDiscountToOrder();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id/update-extras", async function (req, res, next) {
  try {
    const data = await new OrderController(req).updateOrderCustomExtras();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
