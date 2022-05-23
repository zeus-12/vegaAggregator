let router = new ACCELERONCORE._routes.BaseRouter();
let LoginController = require("../controllers/LoginController");

router.post("/", async function (req, res, next) {
  try {
    const data = await new LoginController(req).userLogin();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

module.exports = router;
