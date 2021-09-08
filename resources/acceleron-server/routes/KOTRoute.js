let router = new ACCELERONCORE._routes.BaseRouter();
let KOTController = require('../controllers/KOTController');

router.get('/filter', async function (req, res, next) {
    try {
        const data = await new KOTController(req).fetchKOTsByFilter();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})

router.get('/:id', async function (req, res, next) {
    try {
        const data = await new KOTController(req).getKOTById();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})
router.put('/tabletransfer',async function(req, res, next) {
  try {
    const data = await new KOTController(req).tableTransferKOT();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error)
  }
})

module.exports = router;