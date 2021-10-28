let router = new ACCELERONCORE._routes.BaseRouter();
let ManageMenuController = require('../controllers/ManageMenuController');

router.post('/otherMenuMapping', async function(req, res, next) {
  try {
    const data = await new ManageMenuController(req).createNewMappedMenu();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error)
  }
})


router.get('/otherMenuMapping/:menuTypeCode', async function(req, res, next) {
  try {
    const data = await new ManageMenuController(req).getMappedMenuByType();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error)
  }
})

router.post('/otherMenuMapping/:menuTypeCode', async function(req, res, next) {
  try {
    const data = await new ManageMenuController(req).createNewMappedItem();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error)
  }
})

router.post('/otherMenuMapping/:menuTypeCode/createWithArray', async function(req, res, next) {
  try {
    const data = await new ManageMenuController(req).createMappedItemsWithArray();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error)
  }
})

router.put('/otherMenuMapping/:menuTypeCode/item/:itemIndex', async function(req, res, next) {
  try {
    const data = await new ManageMenuController(req).updateMappedMenuByType();
    return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
  } catch (error) {
    return next(error)
  }
})

 

 


module.exports = router;