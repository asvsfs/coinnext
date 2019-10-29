(function() {
  var JsonRenderer, MarketHelper, MarketStats, Order, OrderLog, TradeStats;

  MarketHelper = require("../lib/market_helper");

  MarketStats = global.db.MarketStats;

  TradeStats = global.db.TradeStats;

  OrderLog = global.db.OrderLog;

  Order = global.db.Order;

  JsonRenderer = require("./../lib/json_renderer");

  module.exports = function(app) {
    // Provides an overview of all our markets
    app.get("/v1/market/summary", function(req, res, next) {
      return MarketStats.findMarkets(null, null, function(err, marketStats) {
        if (err) {
          return res.json({
            error: {
              code: 404,
              message: "Not found"
            }
          });
        }
        return res.send(JsonRenderer.marketSummary(marketStats));
      });
    });
    
    // Provides an overview of only BTC markets at this time
    // Example: /v1/market/summary/BTC
    app.get("/v1/market/summary/:exchange", function(req, res, next) {
      var exchange;
      exchange = req.params.exchange;
      if (!MarketHelper.isValidExchange(exchange)) {
        return res.json({
          error: {
            code: 404,
            message: "Not found"
          }
        });
      }
      return MarketStats.findMarkets(null, exchange).complete(function(err, marketStats) {
        if (err) {
          return res.json({
            error: {
              code: 404,
              message: "Not found"
            }
          });
        }
        return res.send(JsonRenderer.marketSummary(marketStats));
      });
    });
    
    // Provides the statistics for a single market.
    // Example: /v1/market/trades/AUR/BTC
    app.get("/v1/market/stats/:coin/:exchange", function(req, res, next) {
      var coin, exchange;
      coin = req.params.coin;
      exchange = req.params.exchange;
      if (!MarketHelper.isValidMarketPair(coin, exchange)) {
        return res.json({
          error: {
            code: 404,
            message: "Not found"
          }
        });
      }
      return MarketStats.findMarkets(coin, exchange).complete(function(err, marketStats) {
        if (err) {
          return res.json({
            error: {
              code: 404,
              message: "Not found"
            }
          });
        }
        return res.send(JsonRenderer.marketSummary(marketStats));
      });
    });
    // Fetches the last 100 trades for a given market.
    // Example: /v1/market/trades/MINT/BTC
    app.get("/v1/market/trades/:coin/:exchange", function(req, res, next) {
      var coin, exchange, options;
      coin = req.params.coin;
      exchange = req.params.exchange;
      if (!MarketHelper.isValidMarketPair(coin, exchange)) {
        return res.json({
          error: {
            code: 404,
            message: "Not found"
          }
        });
      }
      options = {};
      options.currency1 = coin;
      options.currency2 = exchange;
      options.limit = 100;
      return OrderLog.findActiveByOptions(options, function(err, orderLogs) {
        if (err) {
          return res.json({
            error: {
              code: 404,
              message: "Not found"
            }
          });
        }
        return res.send(JsonRenderer.lastTrades(orderLogs));
      });
    });
    // Fetches the 50 best priced orders of a given type for a given market.
    // Example: /v1/market/orders/MINT/BTC/BUY
    app.get("/v1/market/orders/:coin/:exchange/:type", function(req, res, next) {
      var coin, exchange, options, type;
      coin = req.params.coin;
      exchange = req.params.exchange;
      type = req.params.type.toLowerCase();
      if (!MarketHelper.isValidMarketPair(coin, exchange) || !MarketHelper.isValidOrderAction(type)) {
        return res.json({
          error: {
            code: 404,
            message: "Not found"
          }
        });
      }
      options = {};
      options.status = "open";
      options.action = type;
      options.currency1 = coin;
      options.currency2 = exchange;
      options.published = true;
      options.limit = 50;
      if (options.action === "buy") {
        options.sort_by = [["unit_price", "DESC"], ["created_at", "ASC"]];
      } else if (options.action === "sell") {
        options.sort_by = [["unit_price", "ASC"], ["created_at", "ASC"]];
      }
      return Order.findByOptions(options, function(err, orders) {
        if (err) {
          return res.json({
            error: {
              code: 404,
              message: "Not found"
            }
          });
        }
        return res.send(JsonRenderer.lastOrders(options.action, orders));
      });
    });
    // Fetches the chart data for a market for a given time period. 
    // The period is an optional parameter and can be either '6hh' (6 hours), '1DD' (24 hours), '3DD' (3 days), '7DD' (1 week) or 'MAX'.
    // If no period is defined, it will default to 6 hours. 
    // The market ID can be found by checking the market summary or market stats.
    // Example: /v1/market/chartdata/5/1DD
    return app.get("/v1/market/chartdata/:market_id/:period?", function(req, res, next) {
      var options;
      options = {};
      options.marketId = req.params.market_id;
      if (req.params.period != null) {
        options.period = req.params.period;
      }
      return TradeStats.findByOptions(options, function(err, tradeStats) {
        if (err) {
          return res.json({
            error: {
              code: 404,
              message: "Not found"
            }
          });
        }
        return res.send(JsonRenderer.chartData(tradeStats));
      });
    });
  };

}).call(this);
