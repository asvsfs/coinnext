(function() {
  var Chat, JsonRenderer, SessionSockets, SocketsRedisStore, exports, externalEventsSub, initSockets, io, redis, socketClient, socketPub, socketSub, sockets;

  io = require("socket.io");
  // SessionSockets = require("session.socket.io");
  redis = require("redis");
  SocketsRedisStore  = require('socket.io-redis');

  var te = global.appConfig(); 
  socketPub = redis.createClient(global.appConfig().redis.uri);

  socketSub = redis.createClient(global.appConfig().redis.uri);

  socketClient = redis.createClient(global.appConfig().redis.uri);

  externalEventsSub = redis.createClient(global.appConfig().redis.uri);

  passportSocketIo = require("passport.socketio");

  Chat = global.db.Chat;

  JsonRenderer = require("./json_renderer");

  sockets = {};

  initSockets = function(server, env, sessionStore, cookieParser) {
    var ioOptions;
    ioOptions = {
      log: env === "production" ? false : false
    };
    io = io(server);
    io.adapter(SocketsRedisStore({
      pubClient:socketPub,
      subClient:socketSub
    }))
    sockets.io =io;
    io.use(passportSocketIo.authorize({
      cookieParser: cookieParser,       // the same middleware you registrer in express
      key:          global.appConfig().session.session_key,       // the name of the cookie where express/connect stores its session_id
      secret:       global.appConfig().session.cookie_secret,    // the session_secret to parse the cookie
      store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
      success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
      fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
    }));
    
    function onAuthorizeSuccess(data, accept){
      console.log('successful connection to socket.io');
    
      // The accept-callback still allows us to decide whether to
      // accept the connection or not.
      accept(null, true);
    
      // OR
    
      // If you use socket.io@1.X the callback looks different
      accept();
    }
    
    function onAuthorizeFail(data, message, error, accept){
      if(error){
        // throw new Error(message);
      console.log('failed connection to socket.io:', message);}
    
      // We use this callback to log all of our failed connections.
      accept(null, false);
    
      // OR
    
      // If you use socket.io@1.X the callback looks different
      // If you don't want to accept the connection
      if(error)
        accept(new Error(message));
      // this error will be sent to the user as a special error-package
      // see: http://socket.io/docs/client-api/#socket > error-object
    }

    externalEventsSub.subscribe("external-events");
    externalEventsSub.on("message", function(channel, data) {
      var e, sId, so, _ref;
      if (channel === "external-events") {
        try {
          data = JSON.parse(data);
          if (data.namespace === "users") {
            _ref = sockets.io.of("/users").sockets;
            for (sId in _ref) {
              so = _ref[sId];
              if (so.user_id === data.user_id) {
                so.emit(data.type, data.eventData);
              }
            }
          }
          if (data.namespace === "orders") {
            sockets.io.of("/orders").emit(data.type, data.eventData);
          }
        } catch (_error) {
          e = _error;
          console.error("Could not emit to socket " + data + ": " + e);
        }
        return this;
      }
    });
    // sockets.sessionSockets = new SessionSockets(sockets.io, sessionStore, cookieParser, global.appConfig().session.session_key);
    sockets.io.of("/users").on("connection", function(socket) {
      console.log('user connected')
    });
    sockets.io.of("/orders").on("connection", function(socket) {});
    sockets.io.of("/chat").on("connection", function(socket) {
      console.log('chat connected')
      return socket.on("add-message", function(data) {
        if (!socket.request.user) {
          return;
        }
        data.user_id = socket.request.user.id;
        Chat.addMessage(data, function(err, message) {
          if (err) {
            return console.error(err);
          }
          return message.getUser().success(function(user) {
            return sockets.io.of("/chat").emit("new-message", JsonRenderer.chatMessage(message, user));
          });
        });
        return this;
      });
    });
    return sockets;
  };

  exports = module.exports = initSockets;

}).call(this);
