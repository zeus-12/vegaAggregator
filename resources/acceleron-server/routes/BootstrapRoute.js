let router = new ACCELERONCORE._routes.BaseRouter();
let BootstrapController = require('../controllers/BootstrapController'); 

router.get('/initiate-aggregator', async function (req, res, next) {
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

router.get('/initialise-processing', async function (req, res, next) {
  try{
      const data = await new BootstrapController(req).listenRequest();
      return await new BaseResponse(ResponseType.SUCCESS).send(res,data);
  } catch(error) {
      return next(error);
  }
})


router.delete('/action_request/:ID', async function (req, res, next) {
  try{
      const data = await new BootstrapController(req).deleteActionRequestById();
      return await new BaseResponse(ResponseType.SUCCESS).send(res,data);
  } catch(error) {
      return next(error);
  }
})
module.exports = router;
