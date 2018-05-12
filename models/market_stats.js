(function() {
  var MarketHelper, math, _;

  MarketHelper = require("../lib/market_helper");

  math = require("../lib/math");

  _ = require("underscore");

  module.exports = function(sequelize, DataTypes) {
    var MarketStats;
    MarketStats = sequelize.define("MarketStats", {
      type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        get: function() {
          return MarketHelper.getMarketLiteral(this.getDataValue("type"));
        },
        set: function(type) {
          return this.setDataValue("type", MarketHelper.getMarket(type));
        }
      },
      last_price: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      yesterday_price: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      day_high: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      day_low: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      top_bid: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      top_ask: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      volume1: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      volume2: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      growth_ratio: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        comment: "FLOAT x 100000000"
      },
      today: {
        type: DataTypes.DATE
      },
      status: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: MarketHelper.getOrderStatus("enabled"),
        allowNull: false,
        comment: "enabled, disabled",
        get: function() {
          return MarketHelper.getMarketStatusLiteral(this.getDataValue("status"));
        },
        set: function(status) {
          return this.setDataValue("status", MarketHelper.getMarketStatus(status));
        }
      },
      tableName: "market_stats",
    });
    MarketStats.prototype.label = function(){
      if (this.type) {
        return this.type.substr(0, this.type.indexOf("_"));
      }
    }
    MarketStats.prototype.exchange= function() {
      if (this.type) {
        return this.type.substr(this.type.indexOf("_") + 1);
      }
    }
    MarketStats.getStats = function(){
      var query;
      query = {
        where: {
          status: {
            ne: MarketHelper.getMarketStatus("removed")
          }
        }
      };
      return MarketStats.findAll(query).then(function( marketStats) {
        var stat, stats, _i, _len;
        marketStats = _.sortBy(marketStats, function(s) {
          return s.type;
        });
        stats = {};
        for (_i = 0, _len = marketStats.length; _i < _len; _i++) {
          stat = marketStats[_i];
          stats[stat.type] = stat;
        }
        // return callback(null, stats);
        return stats;
      }).catch(err=>{
        throw err;
      })
    }
    MarketStats.trackFromNewOrder = function(order){//TODO
      var type;
      type = order.action === "buy" ? "" + order.buy_currency + "_" + order.sell_currency : "" + order.sell_currency + "_" + order.buy_currency;
      return MarketStats.find({
        where: {
          type: MarketHelper.getMarket(type)
        }
      }).then(function( marketStats) {
        if (order.action === "buy") {
          if (order.unit_price > marketStats.top_bid) {
            marketStats.top_bid = order.unit_price;
          }
        }
        if (order.action === "sell") {
          if (order.unit_price < marketStats.top_ask || marketStats.top_ask === 0) {
            marketStats.top_ask = order.unit_price;
          }
        }
        return marketStats.save().then(res=>{
          return res;
        })
      }).catch(err=>{
        throw err;
      })
    }
    MarketStats.trackFromCancelledOrder = function(order, callback){
      var type;
      if (callback == null) {
        callback = function() {};
      }
      type = order.action === "buy" ? "" + order.buy_currency + "_" + order.sell_currency : "" + order.sell_currency + "_" + order.buy_currency;
      return MarketStats.find({
        where: {
          type: MarketHelper.getMarket(type)
        }
      }).complete(function(err, marketStats) {
        return global.db.Order.findTopBid(order.buy_currency, order.sell_currency, function(err1, topBidOrder) {
          return global.db.Order.findTopAsk(order.buy_currency, order.sell_currency, function(err2, topAskOrder) {
            marketStats.top_bid = topBidOrder ? topBidOrder.unit_price : 0;
            marketStats.top_ask = topAskOrder ? topAskOrder.unit_price : 0;
            return marketStats.save().complete(callback);
          });
        });
      });
    }
    MarketStats.trackFromMatchedOrder = function(orderToMatch, matchingOrder, callback){
      var type;
      if (callback == null) {
        callback = function() {};
      }
      type = orderToMatch.action === "buy" ? "" + orderToMatch.buy_currency + "_" + orderToMatch.sell_currency : "" + orderToMatch.sell_currency + "_" + orderToMatch.buy_currency;
      return MarketStats.find({
        where: {
          type: MarketHelper.getMarket(type)
        }
      }).complete(function(err, marketStats) {
        return global.db.Order.findTopBid(orderToMatch.buy_currency, orderToMatch.sell_currency, function(err1, topBidOrder) {
          return global.db.Order.findTopAsk(orderToMatch.buy_currency, orderToMatch.sell_currency, function(err2, topAskOrder) {
            marketStats.top_bid = topBidOrder ? topBidOrder.unit_price : 0;
            marketStats.top_ask = topAskOrder ? topAskOrder.unit_price : 0;
            return marketStats.save().complete(callback);
          });
        });
      });
    }
    MarketStats.trackFromOrderLog = function(orderLog, callback){
      if (callback == null) {
        callback = function() {};
      }
      return orderLog.getOrder().complete(function(err, order) {
        var type;
        type = order.action === "buy" ? "" + order.buy_currency + "_" + order.sell_currency : "" + order.sell_currency + "_" + order.buy_currency;
        return MarketStats.find({
          where: {
            type: MarketHelper.getMarket(type)
          }
        }).complete(function(err, marketStats) {
          marketStats.resetIfNotToday();
          marketStats.last_price = orderLog.unit_price;
          if (orderLog.unit_price > marketStats.day_high) {
            marketStats.day_high = orderLog.unit_price;
          }
          if (orderLog.unit_price < marketStats.day_low || marketStats.day_low === 0) {
            marketStats.day_low = orderLog.unit_price;
          }
          if (order.action === "buy") {
            marketStats.save().complete(callback);
          }
          if (order.action === "sell") {
            marketStats.volume1 = parseInt(math.add(MarketHelper.toBignum(marketStats.volume1), MarketHelper.toBignum(orderLog.matched_amount)));
            marketStats.volume2 = parseInt(math.select(MarketHelper.toBignum(marketStats.volume2)).add(MarketHelper.toBignum(orderLog.result_amount)).add(MarketHelper.toBignum(orderLog.fee)).done());
            return global.db.TradeStats.findLast24hByType(type, function(err, tradeStats) {
              var growthRatio;
              if (tradeStats == null) {
                tradeStats = {};
              }
              growthRatio = MarketStats.calculateGrowthRatio(tradeStats.close_price, orderLog.unit_price);
              marketStats.growth_ratio = math.round(MarketHelper.toBigint(growthRatio), 0);
              return marketStats.save().complete(callback);
            });
          }
        });
      });
    }
    MarketStats.calculateGrowthRatio = function(lastPrice, newPrice){
      if (!lastPrice) {
        return 100;
      }
      return parseFloat(math.select(MarketHelper.toBignum(newPrice)).multiply(MarketHelper.toBignum(100)).divide(MarketHelper.toBignum(lastPrice)).subtract(MarketHelper.toBignum(100)).done());
    }
    MarketStats.findEnabledMarket = function(currency1,currency2, callback){
      var query, type;
      if (callback == null) {
        callback = function() {};
      }
      if (currency1 === "BTC") {
        return callback(null, true);
      }
      type = "" + currency1 + "_" + currency2;
      query = {
        where: {
          type: MarketHelper.getMarket(type),
          status: MarketHelper.getMarketStatus("enabled")
        }
      };
      return MarketStats.find(query).complete(callback);    
    }
    MarketStats.setMarketStatus  = function(id , status, callback){
      if (callback == null) {
        callback = function() {};
      }
      return MarketStats.update({
        status: status
      }, {
        id: id
      }).complete(callback);
    }
    MarketStats.findMarkets = function(currency1, currency2, callback){
      var query;
      if (callback == null) {
        callback = function() {};
      }
      query = {
        where: {
          status: {
            ne: MarketHelper.getMarketStatus("removed")
          }
        }
      };
      if (currency1 !== null && currency2 !== null) {
        query.where.type = MarketHelper.getMarket("" + currency1 + "_" + currency2);
      } else if (currency1 === null && currency2 !== null) {
        query.where.type = {};
        query.where.type["in"] = MarketHelper.getExchangeMarketsId(currency2);
      }
      return MarketStats.findAll(query).complete(callback);
    }
    MarketStats.findRemovedCurrencies = function(callback) {
      var query;
      if (callback == null) {
        callback = function() {};
      }
      query = {
        where: {
          status: MarketHelper.getMarketStatus("removed")
        }
      };
      return MarketStats.findAll(query).complete(function(err, removedMarkets) {
        var market, removedCurrencies, _i, _len;
        if (removedMarkets == null) {
          removedMarkets = [];
        }
        removedCurrencies = [];
        for (_i = 0, _len = removedMarkets.length; _i < _len; _i++) {
          market = removedMarkets[_i];
          removedCurrencies.push(market.label);
        }
        return callback(err, removedCurrencies);
      });
    }
    MarketStats.prototype.getFloat = function(attribute){
      return MarketHelper.fromBigint(this[attribute]);
    }
    MarketStats.prototype.resetIfNotToday = function(){
      var today;
        today = new Date().getDate();
        if (!this.today || (today !== this.today.getDate())) {
          this.today = new Date();
          this.yesterday_price = this.last_price;
          this.day_high = 0;
          this.day_low = 0;
          this.top_bid = 0;
          this.top_ask = 0;
          this.volume1 = 0;
          return this.volume2 = 0;
        }
    }
    return MarketStats;
  };

}).call(this);
