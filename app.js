// Configure logger
if (process.env.NODE_ENV === "production") require("./configs/logger");

// Configure modules
var express = require('express');
var http = require('http');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var RedisStore = require('connect-redis')(session);
var helmet = require('helmet');
var simpleCdn = require('express-simple-cdn');
var CoreAPIClient = require('./lib/core_api_client');
var environment = process.env.NODE_ENV || 'development';
var compression = require('compression');
var methodOverride = require('method-override');
var csrf = require('csurf');
var errorHandler = require('errorhandler');
// Configure globals
global.appConfig = require("./configs/config");
global.passport = require('passport');
global.coreAPIClient = new CoreAPIClient({host: global.appConfig().wallets_host});
global.db = require('./models/index');

require('./lib/auth');

// Setup express
var app = express();
// var cookieParser = express.cookieParser(global.appConfig().session.cookie_secret);
var sessionStore = new RedisStore(global.appConfig().redis);
var connectAssetsOptions = environment !== 'development' && environment !== 'test' ? {minifyBuilds: true, servePath: global.appConfig().assets_host} : {};
connectAssetsOptions.helperContext = app.locals
app.locals.CDN = function(path, noKey) {
  var glueSign = path.indexOf("?") > -1 ? "&" : "?";
  var assetsKey = !noKey && global.appConfig().assets_key ? glueSign + "_=" + global.appConfig().assets_key : "";
  return simpleCdn(path, global.appConfig().assets_host) + assetsKey;
};
app.enable("trust proxy");
app.disable('x-powered-by');
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('charting_library',__dirname +'/charting_library');
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

app.use(function(req, res, next) {
  var origin = req.headers.origin ;
	if(origin){
		res.setHeader('Access-Control-Allow-Origin', origin);
	}
  return next();
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.render("errors/500");
});

// Configuration
app.use(errorHandler());
// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });

// app.configure('production', function(){
//   app.use(express.errorHandler());
// });

var server = http.createServer(app);

require("./lib/sockets")(server, environment, sessionStore, cookieParser);

server.listen(app.get('port'), function(){
  console.log("Separdaz is running on port %d in %s mode", app.get("port"), app.settings.env);
});


//User validation
if (global.appConfig().site_auth) {
  var auth = function (req, res, next) {
    if ((req.query.u === global.appConfig().site_auth.user) && (req.query.p === global.appConfig().site_auth.pass)) {
      req.session.staging_auth = true;
    }
    if (!req.session.staging_auth) return res.redirect("http://www.youtube.com/watch?v=oHg5SJYRHA0");
    next();
  }
  app.get('*', auth);
}


// Routes
require('./routes/site')(app);
require('./routes/tradeView')(app);
require('./routes/auth')(app);
require('./routes/users')(app);
require('./routes/wallets')(app);
require('./routes/payments')(app);
require('./routes/transactions')(app);
require('./routes/orders')(app);
require('./routes/order_logs')(app);
require('./routes/chat')(app);
require('./routes/errors')(app);
require('./routes/api')(app);
