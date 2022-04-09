let router = new ACCELERONCORE._routes.BaseRouter();
let PendingBillController = require('../controllers/PendingBillController');

router.get('/search', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/searchbill', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).searchBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/searchdefault', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).searchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});
router.put('/searchall', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).searchAll();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.put('/update_bill', async function (req, res, next) {
  try {
    const data = await new PendingBillController(req).updateBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
