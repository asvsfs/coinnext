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
    // ({
    //   store: new SocketsRedisStore({
    //     redis: redis,
    //     redisPub: socketPub,
    //     redisSub: socketSub,
    //     redisClient: socketClient
    //   }),
    //   origins: "" + (global.appConfig().users.hostname) + ":*"
    // })

    //  io.listen(server, ioOptions);
    // sockets.io.configure("production", function() {
      // sockets.io.enable("browser client minification");
      // sockets.io.enable("browser client etag");
      // sockets.io.enable("browser client gzip");
      // return sockets.io.set("origins", "" + (global.appConfig().users.hostname) + ":*");
    // });

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
    // sockets.sessionSockets.of("/users").on("connection", function(err, socket, session) {
    //   if (session && session.passport) {
    //     return socket.user_id = session.passport.user;
    //   }
    // });
    sockets.io.of("/orders").on("connection", function(socket) {});
    // sockets.sessionSockets.of("/chat").on("connection", function(err, socket, session) {
    //   if (session && session.passport) {
    //     socket.user_id = session.passport.user;
    //   }
    //   return socket.on("add-message", function(data) {
    //     if (!socket.user_id) {
    //       return;
    //     }
    //     data.user_id = socket.user_id;
    //     Chat.addMessage(data, function(err, message) {
    //       if (err) {
    //         return console.error(err);
    //       }
    //       return message.getUser().success(function(user) {
    //         return sockets.io.of("/chat").emit("new-message", JsonRenderer.chatMessage(message, user));
    //       });
    //     });
    //     return this;
    //   });
    // });
    return sockets;
  };

  exports = module.exports = initSockets;

}).call(this);
