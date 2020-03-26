let router = new ACCELERONCORE._routes.BaseRouter();
let UserController = require('../controllers/UserController');

router.get('/fetch', function (req, res, next) {
    return new UserController(req).getAllUsers(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.post('/create', function (req, res, next) {
    return new UserController(req).createNewUser(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.post('/delete', function (req, res, next) {
    return new UserController(req).deleteUserById(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.post('/changepasscode', function (req, res, next) {
    return new UserController(req).changeUserPasscode(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.get('/:id', function (req, res, next) {
    return new UserController(req).getUserById(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

module.exports = router;