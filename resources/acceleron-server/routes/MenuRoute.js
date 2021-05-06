let router = new ACCELERONCORE._routes.BaseRouter();
let MenuController = require('../controllers/MenuController');

router.get('/',async function(req, res, next) {
      try {
        const data = await new MenuController(req).getFullMenu();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
    })

router.route('/category')
    .get(async function(req, res, next) {
      try {
        const data = await new MenuController(req).getCategoryList();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
    })
    .post(async function(req, res, next) {
      try {
        const data = await new MenuController(req).createNewCategory();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
    });

router.route('/category/:categoryName')
  .get(async function(req, res, next) {
    try {
      const data = await new MenuController(req).getCategoryByName();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })
  .put(async function(req, res, next) {
    try {
      const data = await new MenuController(req).updateCategoryByName();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })
  .delete(async function(req, res, next) {
    try {
      const data = await new MenuController(req).deleteCategoryByName();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  });


  router.route('/category/:categoryName/item/')
    .get(async function(req, res, next) {
      try {
        const data = await new MenuController(req).getAllItems();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
    })
    .post(async function(req, res, next) {
      try {
        const data = await new MenuController(req).createNewItem();
        return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
      } catch (error) {
        return next(error)
      }
    });

  router.route('/category/:categoryName/item/:itemCode')
  .get(async function(req, res, next) {
    try {
      const data = await new MenuController(req).getItemByCode();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })
  .put(async function(req, res, next) {
    try {
      const data = await new MenuController(req).updateItemByCode();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })
  .delete(async function(req, res, next) {
    try {
      const data = await new MenuController(req).deleteItemByCode();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  });


  // Other APIs
  router.put('/item/:itemCode/toggleAvailability', async function(req, res, next) {
    try {
      const data = await new MenuController(req).toggleAvailability();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })

  router.put('/markAllMenuAvailable', async function(req, res, next) {
    try {
      const data = await new MenuController(req).markAllMenuAvailable();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })

  router.get('/getLastItemCode', async function(req, res, next) {
    try {
      const data = await new MenuController(req).getLastItemCode();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })

  router.put('/category/:categoryName/markAllAvailableByCategory', async function(req, res, next) {
    try {
      const data = await new MenuController(req).markAllAvailableByCategory();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })

  router.put('/item/:itemCode/moveItemToCategory', async function(req, res, next) {
    try {
      const data = await new MenuController(req).moveItemToCategory();
      return await new BaseResponse(ResponseType.SUCCESS).send(res, data);
    } catch (error) {
      return next(error)
    }
  })


module.exports = router;