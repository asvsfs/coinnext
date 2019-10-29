(function() {
  var FraudHelper, MarketHelper, Order, Payment, Transaction, Wallet, async, exports, math;

  Wallet = global.db.Wallet;

  Transaction = global.db.Transaction;

  Payment = global.db.Payment;

  Order = global.db.Order;

  MarketHelper = require("./market_helper");

  async = require("async");

  math = require("./math");

  FraudHelper = {
    checkWalletBalance: function(walletId, callback) {
      return Wallet.findById(walletId, function(err, wallet) {
        if (err) {
          return callback(err);
        }
        if (!wallet) {
          return callback("Wallet not found.");
        }
        return FraudHelper.checkBalances(wallet, callback);
      });
    },
    checkUserBalances: function(userId, callback) {
      return Wallet.findUserWalletByCurrency(userId, "BTC", function(err, wallet) {
        if (err) {
          return callback(err);
        }
        if (!wallet) {
          return callback("Wallet not found.");
        }
        return FraudHelper.checkBalances(wallet, callback);
      });
    },
    checkBalances: function(wallet, callback) {
      return Transaction.findTotalReceivedByUserAndWallet(wallet.user_id, wallet.id, function(err, totalReceived) {
        if (err) {
          return callback(err);
        }
        return Payment.findTotalPayedByUserAndWallet(wallet.user_id, wallet.id, function(err, totalPayed) {
          var closedOptions, openOptions;
          if (err) {
            return callback(err);
          }
          closedOptions = {
            status: ["completed", "partiallyCompleted"],
            user_id: wallet.user_id,
            currency1: wallet.currency,
            include_logs: true,
            include_deleted: true
          };
          openOptions = {
            status: ["open", "partiallyCompleted"],
            user_id: wallet.user_id,
            currency1: wallet.currency,
            include_logs: true
          };
          return Order.findByOptions(closedOptions, function(err, closedOrders) {
            return Order.findByOptions(openOptions, function(err, openOrders) {
              var closedOrder, closedOrdersBalance, finalBalance, i, j, len, len1, openOrder, openOrdersBalance, result;
              closedOrdersBalance = 0;
              openOrdersBalance = 0;
              for (i = 0, len = closedOrders.length; i < len; i++) {
                closedOrder = closedOrders[i];
                if (closedOrder.action === "sell") {
                  if (closedOrder.sell_currency === wallet.currency) {
                    closedOrdersBalance = parseInt(math.subtract(MarketHelper.toBignum(closedOrdersBalance), MarketHelper.toBignum(closedOrder.calculateSpentFromLogs())));
                  }
                  if (closedOrder.buy_currency === wallet.currency) {
                    closedOrdersBalance = parseInt(math.add(MarketHelper.toBignum(closedOrdersBalance), MarketHelper.toBignum(closedOrder.calculateReceivedFromLogs())));
                  }
                }
                if (closedOrder.action === "buy") {
                  if (closedOrder.buy_currency === wallet.currency) {
                    closedOrdersBalance = parseInt(math.add(MarketHelper.toBignum(closedOrdersBalance), MarketHelper.toBignum(closedOrder.calculateReceivedFromLogs())));
                  }
                  if (closedOrder.sell_currency === wallet.currency) {
                    closedOrdersBalance = parseInt(math.subtract(MarketHelper.toBignum(closedOrdersBalance), MarketHelper.toBignum(closedOrder.calculateSpentFromLogs())));
                  }
                }
              }
              for (j = 0, len1 = openOrders.length; j < len1; j++) {
                openOrder = openOrders[j];
                if (openOrder.sell_currency === wallet.currency) {
                  openOrdersBalance = parseInt(math.add(MarketHelper.toBignum(openOrdersBalance), MarketHelper.toBignum(openOrder.left_hold_balance)));
                }
              }
              finalBalance = parseInt(math.select(MarketHelper.toBignum(totalReceived)).add(MarketHelper.toBignum(closedOrdersBalance)).subtract(MarketHelper.toBignum(wallet.hold_balance)).subtract(MarketHelper.toBignum(totalPayed)).done());
              result = {
                total_received: MarketHelper.fromBigint(totalReceived),
                total_payed: MarketHelper.fromBigint(totalPayed),
                total_closed: MarketHelper.fromBigint(closedOrdersBalance),
                total_open: MarketHelper.fromBigint(openOrdersBalance),
                balance: MarketHelper.fromBigint(wallet.balance),
                hold_balance: MarketHelper.fromBigint(wallet.hold_balance),
                final_balance: MarketHelper.fromBigint(finalBalance),
                valid_final_balance: finalBalance === wallet.balance,
                valid_hold_balance: openOrdersBalance === wallet.hold_balance
              };
              return callback(err, result);
            });
          });
        });
      });
    }
  };

  exports = module.exports = FraudHelper;

}).call(this);
