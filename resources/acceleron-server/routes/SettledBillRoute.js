let router = new ACCELERONCORE._routes.BaseRouter();
let SettledBillController = require('../controllers/SettledBillController');

router.get('/search', async function (req, res, next) {
  try {
    const data = await new SettledBillController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/search/:BILL_NUMBER', async function (req, res, next) {
  try {
    const data = await new SettledBillController(req).searchBill();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async function (req, res, next) {
  try {
    const data = await new SettledBillController(req).searchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});
router.get('/filter', async function (req, res, next) {
  try {
    const data = await new SettledBillController(req).searchAll();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

//TODO:add new route

module.exports = router;
