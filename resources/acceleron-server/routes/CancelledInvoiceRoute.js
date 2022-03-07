let router = new ACCELERONCORE._routes.BaseRouter();
let CancelledInvoiceController = require('../controllers/CancelledInvoiceController');

router.get('/search', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/searchbill', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).searchBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/searchdefault', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).searchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});
router.get('/searchall', async function (req, res, next) {
  try {
    const data = await new CancelledInvoiceController(req).searchAll();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
