let router = new ACCELERONCORE._routes.BaseRouter();
let CustomerManangementController = require("../controllers/CustomerManangementController");

router.post("/", async function (req, res, next) {
  try {
    const data = await new CustomerManangementController(req).addNewCustomer();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    const data = await new CustomerManangementController(req).updateCustomerAddress();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
