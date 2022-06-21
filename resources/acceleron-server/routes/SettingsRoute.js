let router = new ACCELERONCORE._routes.BaseRouter();
let SettingsController = require("../controllers/SettingsController");

router.get("/applyquickfix", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).applyQuickFix();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).getSettingsById();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/newentry", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).addNewEntryToSettings();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/removeentry", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).removeEntryFromSettings();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/filter", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).filterItemFromSettingsList();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/updateentry", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).updateItemFromSettingsList();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/add-default",async function (req,res,next){
    try{
        const data = await new SettingsController(req).addDefaultSettingsData();
        return await new BaseResponse(ResponseType.SUCCESS).send(res,data);
    }catch(error){
        next(error);
    }
})

// Other APIs

router.put(
  "/ACCELERATE_KOT_RELAYING/renamecategory",
  async function (req, res, next) {
    try {
      const data = await new SettingsController(req).renameCategoryKOTRelays();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  "/ACCELERATE_KOT_RELAYING/deletecategory",
  async function (req, res, next) {
    try {
      const data = await new SettingsController(req).deleteCategoryKOTRelays();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error);
    }
  }
);

router.put("/:id/resetindex", async function (req, res, next) {
  try {
    const data = await new SettingsController(req).resetBillingIndex();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
