let router = new ACCELERONCORE._routes.BaseRouter();
let TableController = require('../controllers/TableController');

router.get('/filter', function (req, res, next) {
    return new TableController(req).fetchTablesByFilter(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.get('/:id/resettable', function (req, res, next) {
    return new TableController(req).resetTable(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.get('/:id', function (req, res, next) {
    return new TableController(req).getTableById(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

module.exports = router;