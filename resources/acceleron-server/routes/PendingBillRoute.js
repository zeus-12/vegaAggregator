let router = new ACCELERONCORE._routes.BaseRouter();
let PendingBillController = require('../controllers/PendingBillController');

router.get('/', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).searchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/search', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/search/:BILL_NUMBER', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).searchBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/filter', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).searchAll();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

//TODO: ADD NEW ROUTES AND REMOVE UPDATE_BILL
router.put('/apply-discount', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).applyDiscount();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put('/add-item', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).addItem();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put('/update-delivery-agent', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).updateDeliveryAgent();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put('/settle', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).settleBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
