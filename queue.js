// Configure logger
if (process.env.NODE_ENV === "production") require("./configs/logger");

// Configure modules
var environment = process.env.NODE_ENV || 'development';
var QUEUE_DELAY = 500;

// Configure globals
global.appConfig = require("./configs/config");
global.db = require('./models/index');
global.queue = require('./lib/queue/index');

var TradeHelper = require('./lib/trade_helper');
var Slackhook = require('node-slackr');
var Slackhook = require('slackhook');
var slack = new Slackhook(global.appConfig().slackalerts.url,{
    channel:global.appConfig().slackalerts.channel,
    username:global.appConfig().slackalerts.username,
});

var processEvents = function () {
  global.queue.Event.findNextValid(function (err, event) {
    if (err) return exit("Could not fetch the next event. Exitting...", err);
    if (!event) {
      setTimeout(processEvents, QUEUE_DELAY);
    } else if (event.type === "order_canceled") {
      return processCancellation(event, function (err) {
        if (err) return exit("Could not process cancellation. Exitting...", err);
        setTimeout(processEvents, QUEUE_DELAY);
      });
    } else if (event.type === "order_added") {
      return processAdd(event, function (err) {
        if (err) return exit("Could not process order add. Exitting...", err);
        setTimeout(processEvents, QUEUE_DELAY);
      });
    } else if (event.type === "orders_match") {
      return processMatch(event, function (err) {
        if (err) return exit("Could not process order match. Exitting...", err);
        setTimeout(processEvents, QUEUE_DELAY);
      });
    }
  });
};

var processCancellation = function (event, callback) {
  TradeHelper.cancelOrder(event.loadout.order_id, function (err) {
    if (!err) {
      event.status = "processed";
      event.save().complete(function () {
        return callback();
      });
    } else {
      console.error("Could not process event " + event.id, err);
      return callback(err);
    }
  });
};

var processAdd = function (event, callback) {
  TradeHelper.publishOrder(event.loadout.order_id, function (err) {
    if (!err) {
      event.status = "processed";
      event.save().complete(function () {
        return callback();
      });
    } else {
      console.error("Could not process event " + event.id, err);
      return callback(err);
    }
  });
};

var processMatch = function (event, callback) {
  TradeHelper.matchOrders(event.loadout, function (err) {
    if (!err) {
      event.status = "processed";
      event.save().complete(function () {
        return callback();
      });
    } else {
      console.error("Could not process event " + event.id, err);
      return callback(err);
    }
  });
};

var sendAlert = function (msg, callback) {
  if (!global.appConfig().slackalerts.enabled) {
    if (callback && callback instanceof Function) {
      return callback();
    }
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("sendAlert: not sending alert in dev environment. Message: " + msg);
    if (callback && callback instanceof Function) {
      return callback();
    }
    return;
  }
  // slack.notify(msg,callback);
  slack.notify({
    text: msg,
    channel: global.appConfig().slackalerts.channel,
    username: "asvsfs",
    icon_emoji: ":rotating_light:"
  }, callback);
}

var exit = function (errMessage, err) {
  console.error(errMessage, err);
  sendAlert("Event queue exiting! Message: " + errMessage, function (err, res) {
    console.log("slack:", err, res);
    process.exit();
  })
};

processEvents();
sendAlert("Event queue is processing events...");
console.log("processing events...");

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  sendAlert("Event queue exiting! Exception: " + err, function (err, res) {
    console.log("slack:", err, res);
    process.exit();
  })
});