let router = new ACCELERONCORE._routes.BaseRouter();
let BillingModuleController = require('../controllers/BillingModuleController');

router.delete('/:BILL_NUMBER', async function (req, res, next) {
  try {
    const data = await new BillingModuleController(req).cancelBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
