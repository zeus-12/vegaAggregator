let router = new ACCELERONCORE._routes.BaseRouter();
let SummaryController = require('../controllers/SummaryController');

router.get('/billingmode', async function (req, res, next) {
  try {
    const data = await new SummaryController(req).fetchSummaryByBillingMode();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/billingandpaymentmode', async function (req, res, next) {
  try {
    const data = await new SummaryController(req).fetchSummaryByBillingAndPaymentMode();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/paymentmode', async function (req, res, next) {
  try {
    const data = await new SummaryController(req).fetchSummaryByPaymentMode();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});


module.exports = router;