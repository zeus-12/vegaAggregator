let router = new ACCELERONCORE._routes.BaseRouter();
let KOTController = require('../controllers/KOTController');

router.get('/filter', function (req, res, next) {
    return new KOTController(req).fetchKOTsByFilter(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.get('/:id', function (req, res, next) {
    return new KOTController(req).getKOTById(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

module.exports = router;