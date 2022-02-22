let router = new ACCELERONCORE._routes.BaseRouter();
let CancelledInvoiceController = require('../controllers/CancelledInvoiceController');

//cancelledinvoice/search
router.get('/search', async function (req, res, next) {
  try {
    console.log('inside search route');
    const data = await new CancelledInvoiceController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/searchdefault', async function (req, res, next) {
  try {
    console.log('inside search bill route');
    const data = await new CancelledOrderController(req).searchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});
module.exports = router;
