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

router.post("/saved/new", async function (req, res, next) {
  try {
    const data = await new OrderController(req).saveOrder();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/saved/clear", async function (req, res, next) {
  try {
    const data = await new OrderController(req).clearAllSavedOrders();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/saved/:id/remove", async function (req, res, next) {
  try {
    const data = await new OrderController(req).removeSavedOrder();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

// TO BE IMPLEMENTED
router.put("/:id/apply-discount", async function (req, res, next) {
  try {
    const data = await new OrderController(req).addDiscountToOrder();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

// TO BE IMPLEMENTED
router.put("/:id/update-extras", async function (req, res, next) {
  try {
    const data = await new OrderController(req).updateOrderCustomExtras();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
