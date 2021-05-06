let router = new ACCELERONCORE._routes.BaseRouter();
let SettingsController = require('../controllers/SettingsController');

router.get('/applyquickfix', function (req, res, next) {
    return new SettingsController(req).applyQuickFix(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.get('/:id', function (req, res, next) {
    return new SettingsController(req).getSettingsById(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.post('/:id/newentry', function (req, res, next) {
    return new SettingsController(req).addNewEntryToSettings(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.post('/:id/removeentry', function (req, res, next) {
    return new SettingsController(req).removeEntryFromSettings(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.get('/:id/filter', function (req, res, next) {
    return new SettingsController(req).filterItemFromSettingsList(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.post('/:id/updateentry', function (req, res, next) {
    return new SettingsController(req).updateItemFromSettingsList(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})


// Other APIs

router.put('/ACCELERATE_KOT_RELAYING/renameCategory', function (req, res, next) {
    return new SettingsController(req).renameCategoryKOTRelays(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

router.put('/ACCELERATE_KOT_RELAYING/deleteCategory', function (req, res, next) {
    return new SettingsController(req).deleteCategoryKOTRelays(function (err, data) {
        if (err != null) {
            return next(err);
        }
        return new BaseResponse(ResponseType.SUCCESS).send(res, data);
    });
})

module.exports = router;