let router = new ACCELERONCORE._routes.BaseRouter();
let TableController = require('../controllers/TableController');

router.post('/create', async function (req, res, next) {
    try {
        const data = await new TableController(req).createNewTable();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.post('/update', async function (req, res, next) {
    try {
        const data = await new TableController(req).updateTableByFilter();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.post('/delete', async function (req, res, next) {
    try {
        const data = await new TableController(req).deleteTableByName();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.post('/section/new', async function (req, res, next) {
    try {
        const data = await new TableController(req).addNewTableSection();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.post('/section/delete', async function (req, res, next) {
    try {
        const data = await new TableController(req).deleteTableSection();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.get('/filter', async function (req, res, next) {
    try {
        const data = await new TableController(req).fetchTablesByFilter();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.get('/:id/resettable', async function (req, res, next) {
    try {
        const data = await new TableController(req).resetTable();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.get('/:id', async function (req, res, next) {
    try {
        const data = await new TableController(req).getTableById();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

router.put('/tabletransfer',async function(req, res, next) {
    try {
      const data = await new TableController(req).tableTransferKOT();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })

router.put('/mergekot', async function (req, res, next) {
    try {
        const data = await new TableController(req).mergeKOT();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
        return next(error)
    }
})

module.exports = router;