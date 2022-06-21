let router = new ACCELERONCORE._routes.BaseRouter();
let BootstrapController = require('../controllers/BootstrapController'); 

router.post('/initiate-pos',async function (req,res,next){
    try{
        const data = await new BootstrapController(req).initiateSystem();
        return await new BaseResponse(ResponseType.SUCCESS).send(res,data);
    } catch(error) {
        return next(error);
    }
})

module.exports = router;
