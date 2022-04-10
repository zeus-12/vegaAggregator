let router = new ACCELERONCORE._routes.BaseRouter();
let CancelledOrderController = require('../controllers/CancelledOrderController');

router.get('/', async function (req, res, next) {
  try {
    const data = await new CancelledOrderController(req).searchDefault();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/search', async function (req, res, next) {
  try {
    const data = await new CancelledOrderController(req).search();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get('/filter', async function (req, res, next) {
  try {
    const data = await new CancelledOrderController(req).searchAll();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
