(function() {
  (function() {
    var MarketHelper;
    MarketHelper = void 0;
    MarketHelper = require('../lib/market_helper');
    module.exports = function(sequelize, DataTypes) {
      var TradeStats;
      TradeStats = void 0;
      TradeStats = sequelize.define('TradeStats', {
        type: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          get: function() {
            return MarketHelper.getMarketLiteral(this.getDataValue('type'));
          },
          set: function(type) {
            return this.setDataValue('type', MarketHelper.getMarket(type));
          }
        },
        open_price: {
          type: DataTypes.BIGINT.UNSIGNED,
          defaultValue: 0,
          allowNull: false,
          comment: 'FLOAT x 100000000'
        },
        close_price: {
          type: DataTypes.BIGINT.UNSIGNED,
          defaultValue: 0,
          allowNull: false,
          comment: 'FLOAT x 100000000'
        },
        high_price: {
          type: DataTypes.BIGINT.UNSIGNED,
          defaultValue: 0,
          allowNull: false,
          comment: 'FLOAT x 100000000'
        },
        low_price: {
          type: DataTypes.BIGINT.UNSIGNED,
          defaultValue: 0,
          allowNull: false,
          comment: 'FLOAT x 100000000'
        },
        volume: {
          type: DataTypes.BIGINT.UNSIGNED,
          defaultValue: 0,
          allowNull: false,
          comment: 'FLOAT x 100000000'
        },
        exchange_volume: {
          type: DataTypes.BIGINT.UNSIGNED,
          defaultValue: 0,
          allowNull: false,
          comment: 'FLOAT x 100000000'
        },
        start_time: {
          type: DataTypes.DATE
        },
        end_time: {
          type: DataTypes.DATE
        }
      }, {
        tableName: 'trade_stats',
        timestamps: false,
        classMethods: {
          findByTime: function(options, callback) {
            var endTime, halfHour, marketId, oneDay, oneHour, period, query, sixHours, startTime, threeDays;
            halfHour = void 0;
            marketId = void 0;
            oneDay = void 0;
            oneHour = void 0;
            period = void 0;
            query = void 0;
            sixHours = void 0;
            startTime = void 0;
            threeDays = void 0;
            if (options.marketId) {
              marketId = options.marketId;
            }
            if (options.period) {
              period = options.period;
            }
            halfHour = 1800000;
            oneHour = 2 * halfHour;
            sixHours = 6 * oneHour;
            oneDay = 24 * oneHour;
            threeDays = 3 * oneDay;
            startTime = parseInt(options.startTime) * 1000;
            endTime = parseInt(options.endTime) * 1000;
            query = {
              where: {
                type: marketId,
                start_time: {
                  gte: new Date(startTime),
                  lt: new Date(endTime)
                }
              }
            };
            return TradeStats.findAll(query).complete(callback);
          },
          getLastStats: function(type, callback) {
            var aDayAgo, halfHour, query;
            aDayAgo = void 0;
            halfHour = void 0;
            query = void 0;
            if (callback === null) {
              callback = function() {};
            }
            type = MarketHelper.getMarket(type);
            halfHour = 1800000;
            aDayAgo = Date.now() - 86400000 - halfHour;
            query = {
              where: {
                type: type,
                start_time: {
                  gt: aDayAgo
                }
              },
              order: [['start_time', 'ASC']]
            };
            return TradeStats.findAll(query).complete(callback);
          },
          findLast24hByType: function(type, callback) {
            var aDayAgo, halfHour, query;
            aDayAgo = void 0;
            halfHour = void 0;
            query = void 0;
            type = MarketHelper.getMarket(type);
            halfHour = 1800000;
            aDayAgo = Date.now() - 86400000 + halfHour;
            query = {
              where: {
                type: type,
                start_time: {
                  lt: aDayAgo
                }
              },
              order: [['start_time', 'DESC']]
            };
            return TradeStats.find(query).complete(function(err, tradeStats) {
              if (tradeStats) {
                return callback(err, tradeStats);
              }
              query = {
                where: {
                  type: type
                },
                order: [['start_time', 'ASC']]
              };
              return TradeStats.find(query).complete(function(err, tradeStats) {
                return callback(err, tradeStats);
              });
            });
          },
          findByOptions: function(options, callback) {
            var halfHour, marketId, oneDay, oneHour, period, query, sixHours, startTime, threeDays;
            halfHour = void 0;
            marketId = void 0;
            oneDay = void 0;
            oneHour = void 0;
            period = void 0;
            query = void 0;
            sixHours = void 0;
            startTime = void 0;
            threeDays = void 0;
            if (options.marketId) {
              marketId = options.marketId;
            }
            if (options.period) {
              period = options.period;
            }
            halfHour = 1800000;
            oneHour = 2 * halfHour;
            sixHours = 6 * oneHour;
            oneDay = 24 * oneHour;
            threeDays = 3 * oneDay;
            switch (period) {
              case '30m':
                startTime = Date.now() - halfHour;
                break;
              case '6h':
                startTime = Date.now() - sixHours - halfHour;
                break;
              case '1D':
                startTime = Date.now() - oneDay - halfHour;
                break;
              case '3D':
                startTime = Date.now() - threeDays - halfHour;
                break;
              default:
                startTime = Date.now() - sixHours - halfHour;
            }
            query = {
              where: {
                type: marketId,
                start_time: {
                  gt: new Date(startTime)
                }
              },
              order: [['start_time', 'DESC']]
            };
            return TradeStats.findAll(query).complete(callback);
          }
        },
        instanceMethods: {
          getFloat: function(attribute) {
            if (this[attribute] === null) {
              return this[attribute];
            }
            return MarketHelper.fromBigint(this[attribute]);
          }
        }
      });
      return TradeStats;
    };
  }).call(this);

  // ---
// generated by js2coffee 2.2.0

}).call(this);
