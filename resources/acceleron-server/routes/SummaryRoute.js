let router = new ACCELERONCORE._routes.BaseRouter();
let SummaryController = require("../controllers/SummaryController");

router.get("/:summaryType", async function (req, res, next) {
  try {
    const data = await new SummaryController(req).fetchSummaryByType();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get("/filterby/:filterName", async function (req, res, next) {
  try {
    const data = await new SummaryController(req).fetchSummaryByFilter();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/filterby/:filterName/splitby/:filterParameter",
  async function (req, res, next) {
    try {
      const data = await new SummaryController(
        req
      ).fetchSummaryByFilterDetailed();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
