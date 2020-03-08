let router = new ACCELERONCORE._routes.BaseRouter();
let SettingsController = require('../controllers/SettingsController');

router.get('/fetch/:id', function (req, res, next) {
    return new SettingsController(req).getSettingsById(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

module.exports = router;