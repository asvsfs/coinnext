// Configure logger
if (process.env.NODE_ENV === "production") require("./configs/logger");

// Configure modules
var express = require('express');
var http = require('http');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var compression = require('compression');
var CoreAPIClient = require('./lib/core_api_client');
var _str = require("./lib/underscore_string");
var methodOverride = require('method-override');
var _ = require("underscore");
var environment = process.env.NODE_ENV || 'development';
var csrf = require('csurf');
var errorHandler = require('errorhandler');
// Configure globals
global.appConfig = require("./configs/config");
global.passport = require('passport');
global.coreAPIClient = new CoreAPIClient({host: global.appConfig().wallets_host});
global.db = require('./models/index');

require('./lib/admin_auth');
var admin_auth = require('./tests/helpers/auth_helper');


// Setup express
var app = express();
var sessionStore = new RedisStore(global.appConfig().redis);
var connectAssetsOptions = environment !== 'development' ? {minifyBuilds: true} : {};
connectAssetsOptions.helperContext = app.locals
app.locals._ = _;
app.locals._str = _str;
app.enable("trust proxy");
app.disable('x-powered-by');
app.set('port', process.env.PORT || 6983);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compression());
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  key: global.appConfig().session.session_key,
  store: sessionStore,
  secret: global.appConfig().session.cookie_secret,
  resave: true,
  saveUninitialized: true,
  proxy: true,
  cookie: global.appConfig().session.cookie
}));
if (environment !== "test") {
  app.use(csrf({ cookie: true }))
  app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
  // app.use(helmet.xframe('sameorigin'));
  app.use(helmet.hsts());
  // app.use(helmet.iexss({setOnOldIE: true}));
  // app.use(helmet.ienoopen());
  // app.use(helmet.contentTypeOptions());
  // app.use(helmet.cacheControl());
}
app.use(express.static(__dirname + '/public'));
app.use(require('connect-assets')(connectAssetsOptions));
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);
app.use(function(err, req, res, next) {
  console.error(err);
  res.send(500, "Oups, seems that there is an error on our side. Your coins are safe and we'll be back shortly...");
});


// Configuration

// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });

// app.configure('production', function(){
//   app.use(express.errorHandler());
// });

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Separdaz admin is running on port %d in %s mode", app.get("port"), app.settings.env);
});


// Routes
require('./routes/admin')(app);
