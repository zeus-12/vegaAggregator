let router = new ACCELERONCORE._routes.BaseRouter();
let BootstrapController = require('../controllers/BootstrapController'); 

router.get('/initiate', async function (req, res, next) {
  try {
      const data = await new BootstrapController(req).getDataForAggregatorInitialisation();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
})

router.post('/initialise-pos', async function (req, res, next) {
    try{
        const data = await new BootstrapController(req).initialiseAcceleronPOS();
        return await new BaseResponse(ResponseType.SUCCESS).send(res,data);
    } catch(error) {
        return next(error);
    }
})

module.exports = router;
