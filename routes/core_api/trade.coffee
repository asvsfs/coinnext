restify = require "restify"
Order = global.db.Order
Wallet = global.db.Wallet
MarketStats = global.db.MarketStats
TradeHelper = require "../../lib/trade_helper"
JsonRenderer = require "../../lib/json_renderer"
MarketHelper = require "../../lib/market_helper"

module.exports = (app)->

  app.post "/publish_order", (req, res, next)->
    data = req.body
    data.in_queue = true
    orderCurrency = data["#{data.action}_currency"]
    MarketStats.findEnabledMarket orderCurrency, "BTC", (err, market)->
      return next(new errors.InternalServerError "Market for #{orderCurrency} is disabled.")  if not market
      TradeHelper.createOrder data, (err, newOrder)->
        return next(new errors.InternalServerError err)  if err
        orderData =
          external_order_id: newOrder.id
          type: newOrder.type
          action: newOrder.action
          buy_currency: MarketHelper.getCurrency newOrder.buy_currency
          sell_currency: MarketHelper.getCurrency newOrder.sell_currency
          amount: newOrder.amount
          unit_price: newOrder.unit_price
        global.queue.Event.addOrder orderData, (err)->
          if err
            console.error "Could add add_order event for order #{newOrder.id} - #{err}"
            return next(new errors.InternalServerError "Could not submit order.")  if err
          res.send
            id: newOrder.id
          TradeHelper.pushOrderUpdate
            type: "order-to-add"
            eventData: JsonRenderer.order newOrder

  app.del "/cancel_order/:order_id", (req, res, next)->
    orderId = req.params.order_id
    Order.findById orderId, (err, order)->
      return next(new errors.InternalServerError err)  if err or not order or not order.canBeCanceled()
      orderCurrency = order["#{order.action}_currency"]
      MarketStats.findEnabledMarket orderCurrency, "BTC", (err, market)->
        return next(new errors.InternalServerError "#{new Date()} - Will not process order #{orderId}, the market for #{orderCurrency} is disabled.")  if not market
        global.db.sequelize.transaction (transaction)->
          global.queue.Event.addCancelOrder {order_id: orderId}, (err)->
            if err
              return transaction.rollback().success ()->
                next(new errors.InternalServerError "Could not cancel order #{orderId} - #{err}")
            order.in_queue = true
            order.save({transaction: transaction}).complete (err)->
              if err
                return transaction.rollback().success ()->
                  next(new errors.InternalServerError "Could not set order #{orderId} for canceling - #{err}")
              transaction.commit().success ()->
                res.send
                  id: orderId
                TradeHelper.pushOrderUpdate
                  type: "order-to-cancel"
                  eventData:
                    id: orderId
