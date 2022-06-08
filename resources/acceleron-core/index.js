let all = {
    _utils: {},
    _clients: {},
    _routes: {},
    _models: {},
    _connectors: {},
    _controllers: {},
    _auth: {},
    _services: {}
};

all._connectors.CouchDB = require('./connectors/CouchDBConnector');
all._connectors.CouchDBAsync = require('./connectors/CouchDBConnectorAsync');

all._utils.ErrorResponse = require('./utils/ErrorResponse');
all._utils.BaseResponse = require('./utils/BaseResponse');
all._utils.TraceAttributes = require('./utils/TraceAttributes');

all._routes.BaseRouter = require('./routes/BaseRouter');
all._controllers.BaseController = require('./controllers/BaseController');
all._services.BaseService = require('./services/BaseService');

all._clients.BaseHttpClient = require('./clients/BaseHttpClient');

all._auth.BaseAuth = require('./auth/BaseAuth');

//all._models = require('./models');
all._models.BaseModel = require('./models/BaseModel');


module.exports = all;