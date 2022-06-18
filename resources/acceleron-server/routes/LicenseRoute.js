let router = new ACCELERONCORE._routes.BaseRouter();
let LicenseController = require('../controllers/LicenseController');


router.post('/', async function (req, res, next) {
    try {
        const data = await new LicenseController(req).addNewLicense();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})


router.get('/initiate',async function (req, res, next) {
  try {
      const data = await new LicenseController(req).preloadData();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
})


module.exports = router;