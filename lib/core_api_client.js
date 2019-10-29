(function() {
  var CoreAPIClient, exports, request;

  request = require("request");

  CoreAPIClient = (function() {
    class CoreAPIClient {
      constructor(options = {}) {
        if (options.host) {
          this.host = options.host;
        }
      }

      send(command, data, callback = function() {}) {
        var e, i, len, param, url;
        url = `http://${this.host}/${command}`;
        for (i = 0, len = data.length; i < len; i++) {
          param = data[i];
          url += `/${param}`;
        }
        if (this.commands[command]) {
          try {
            return request[this.commands[command]](url, {
              json: true
            }, callback);
          } catch (error) {
            e = error;
            console.error(e);
            return callback(`Bad response '${e}'`);
          }
        } else {
          return callback(`Invalid command '${command}'`);
        }
      }

      sendWithData(command, data, callback = function() {}) {
        var e, options, uri;
        uri = `http://${this.host}/${command}`;
        if (this.commands[command]) {
          options = {
            uri: uri,
            method: this.commands[command],
            json: data
          };
          try {
            return request(options, callback);
          } catch (error) {
            e = error;
            console.error(e);
            return callback(`Bad response ${e}`);
          }
        } else {
          return callback(`Invalid command '${command}'`);
        }
      }

    };

    CoreAPIClient.prototype.host = null;

    CoreAPIClient.prototype.commands = {
      "create_account": "post",
      "publish_order": "post",
      "cancel_order": "del",
      "create_payment": "post",
      "process_payment": "put",
      "cancel_payment": "del",
      "wallet_balance": "get",
      "wallet_info": "get"
    };

    return CoreAPIClient;

  }).call(this);

  exports = module.exports = CoreAPIClient;

}).call(this);
