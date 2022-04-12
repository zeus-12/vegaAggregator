let router = new ACCELERONCORE._routes.BaseRouter();
let CancelledInvoiceController = require('../controllers/CancelledInvoiceController');

router.get('/', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).fetchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/filter', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).filterByDateRange();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/search/:BILL_NUMBER', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).searchBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/search', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
