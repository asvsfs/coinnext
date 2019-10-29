(->
  MarketHelper = undefined
  MarketHelper = require('../lib/market_helper')

  module.exports = (sequelize, DataTypes) ->
    TradeStats = undefined
    TradeStats = sequelize.define('TradeStats', {
      type:
        type: DataTypes.INTEGER.UNSIGNED
        allowNull: false
        get: ->
          MarketHelper.getMarketLiteral @getDataValue('type')
        set: (type) ->
          @setDataValue 'type', MarketHelper.getMarket(type)
      open_price:
        type: DataTypes.BIGINT.UNSIGNED
        defaultValue: 0
        allowNull: false
        comment: 'FLOAT x 100000000'
      close_price:
        type: DataTypes.BIGINT.UNSIGNED
        defaultValue: 0
        allowNull: false
        comment: 'FLOAT x 100000000'
      high_price:
        type: DataTypes.BIGINT.UNSIGNED
        defaultValue: 0
        allowNull: false
        comment: 'FLOAT x 100000000'
      low_price:
        type: DataTypes.BIGINT.UNSIGNED
        defaultValue: 0
        allowNull: false
        comment: 'FLOAT x 100000000'
      volume:
        type: DataTypes.BIGINT.UNSIGNED
        defaultValue: 0
        allowNull: false
        comment: 'FLOAT x 100000000'
      exchange_volume:
        type: DataTypes.BIGINT.UNSIGNED
        defaultValue: 0
        allowNull: false
        comment: 'FLOAT x 100000000'
      start_time: type: DataTypes.DATE
      end_time: type: DataTypes.DATE
    },
      tableName: 'trade_stats'
      timestamps: false
      classMethods:
        findByTime: (options, callback) ->
          halfHour = undefined
          marketId = undefined
          oneDay = undefined
          oneHour = undefined
          period = undefined
          query = undefined
          sixHours = undefined
          startTime = undefined
          threeDays = undefined
          if options.marketId
            marketId = options.marketId
          if options.period
            period = options.period
          halfHour = 1800000
          oneHour = 2 * halfHour
          sixHours = 6 * oneHour
          oneDay = 24 * oneHour
          threeDays = 3 * oneDay
          startTime = parseInt(options.startTime) * 1000
          endTime = parseInt(options.endTime) * 1000
          query = where:
            type: marketId
            start_time:
              gte: new Date(startTime)
              lt: new Date(endTime)
          TradeStats.findAll(query).complete callback
        getLastStats: (type, callback) ->
          aDayAgo = undefined
          halfHour = undefined
          query = undefined
          if callback == null

            callback = ->

          type = MarketHelper.getMarket(type)
          halfHour = 1800000
          aDayAgo = Date.now() - 86400000 - halfHour
          query =
            where:
              type: type
              start_time: gt: aDayAgo
            order: [ [
              'start_time'
              'ASC'
            ] ]
          TradeStats.findAll(query).complete callback
        findLast24hByType: (type, callback) ->
          aDayAgo = undefined
          halfHour = undefined
          query = undefined
          type = MarketHelper.getMarket(type)
          halfHour = 1800000
          aDayAgo = Date.now() - 86400000 + halfHour
          query =
            where:
              type: type
              start_time: lt: aDayAgo
            order: [ [
              'start_time'
              'DESC'
            ] ]
          TradeStats.find(query).complete (err, tradeStats) ->
            if tradeStats
              return callback(err, tradeStats)
            query =
              where: type: type
              order: [ [
                'start_time'
                'ASC'
              ] ]
            TradeStats.find(query).complete (err, tradeStats) ->
              callback err, tradeStats
        findByOptions: (options, callback) ->
          halfHour = undefined
          marketId = undefined
          oneDay = undefined
          oneHour = undefined
          period = undefined
          query = undefined
          sixHours = undefined
          startTime = undefined
          threeDays = undefined
          if options.marketId
            marketId = options.marketId
          if options.period
            period = options.period
          halfHour = 1800000
          oneHour = 2 * halfHour
          sixHours = 6 * oneHour
          oneDay = 24 * oneHour
          threeDays = 3 * oneDay
          switch period
            when '30m'
              startTime = Date.now() - halfHour
            when '6h'
              startTime = Date.now() - sixHours - halfHour
            when '1D'
              startTime = Date.now() - oneDay - halfHour
            when '3D'
              startTime = Date.now() - threeDays - halfHour
            else
              startTime = Date.now() - sixHours - halfHour
          query =
            where:
              type: marketId
              start_time: gt: new Date(startTime)
            order: [ [
              'start_time'
              'DESC'
            ] ]
          TradeStats.findAll(query).complete callback
      instanceMethods: getFloat: (attribute) ->
        if @[attribute] == null
          return @[attribute]
        MarketHelper.fromBigint @[attribute]
    )
    TradeStats

  return
).call this

# ---
# generated by js2coffee 2.2.0