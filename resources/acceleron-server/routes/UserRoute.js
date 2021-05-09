let router = new ACCELERONCORE._routes.BaseRouter();
let UserController = require('../controllers/UserController');

router.get('/fetch', async function (req, res, next) {
    try {
        const data = await new UserController(req).getAllUsers();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})

router.post('/create', async function (req, res, next) {
    try {
        const data = await new UserController(req).createNewUser();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})

router.post('/delete', async function (req, res, next) {
    try {
        const data = await new UserController(req).deleteUserById();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})

router.post('/changepasscode', async function (req, res, next) {
    try {
        const data = await new UserController(req).changeUserPasscode();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})

router.get('/:id', async function (req, res, next) {
    try {
        const data = await new UserController(req).getUserById();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
})

module.exports = router;