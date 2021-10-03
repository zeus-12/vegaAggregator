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

router.put('/:id', async function (req, res, next) {
  try {
      const data = await new KOTController(req).updateKOTById();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
})

router.delete('/:id', async function (req, res, next) {
  try {
      const data = await new KOTController(req).deleteKOTById();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
})

module.exports = router;