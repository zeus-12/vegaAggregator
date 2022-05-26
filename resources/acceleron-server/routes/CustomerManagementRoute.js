let router = new ACCELERONCORE._routes.BaseRouter();
let CustomerManagementController = require("../controllers/CustomerManagementController");


router.get("/:id", async function (req, res, next) {
  try {
    const data = await new CustomerManagementController(req).getCustomerData();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});
router.post("/", async function (req, res, next) {
  try {
    const data = await new CustomerManagementController(req).addNewCustomer();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    const data = await new CustomerManagementController(req).updateCustomerAddress();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
