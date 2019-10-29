(function() {
  var ClientSocket, exports, redis;

  redis = require("redis");

  ClientSocket = (function() {
    class ClientSocket {
      constructor(options = {}) {
        if (options.namespace) {
          this.namespace = options.namespace;
        }
        this.pub = redis.createClient(options.redis.port, options.redis.host, {
          auth_pass: options.redis.pass
        });
      }

      send(data) {
        data.namespace = this.namespace;
        return this.pub.publish("external-events", JSON.stringify(data));
      }

      close() {
        var e;
        try {
          if (this.pub) {
            return this.pub.quit();
          }
        } catch (error) {
          e = error;
          return console.error(`Could not close Pub connection ${this.namespace}`, e);
        }
      }

    };

    ClientSocket.prototype.namespace = "users";

    ClientSocket.prototype.pub = null;

    return ClientSocket;

  }).call(this);

  exports = module.exports = ClientSocket;

}).call(this);
