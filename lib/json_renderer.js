(function() {
  (function() {
    var JsonRenderer, MarketHelper, _, _str, exports;
    JsonRenderer = void 0;
    MarketHelper = void 0;
    exports = void 0;
    _ = void 0;
    _str = void 0;
    MarketHelper = require('./market_helper');
    _ = require('underscore');
    _str = require('underscore.string');
    JsonRenderer = {
      user: function(user) {
        return {
          id: user.uuid,
          email: user.email,
          username: user.username,
          gauth_qr: user.gauth_qr,
          gauth_key: user.gauth_key,
          chat_enabled: user.chat_enabled,
          email_auth_enabled: user.email_auth_enabled,
          updated_at: user.updated_at,
          created_at: user.created_at
        };
      },
      wallet: function(wallet) {
        return {
          id: wallet.id,
          currency: wallet.currency,
          balance: wallet.getFloat('balance'),
          hold_balance: wallet.getFloat('hold_balance'),
          address: wallet.address,
          min_confirmations: wallet.network_confirmations,
          updated_at: wallet.updated_at,
          created_at: wallet.created_at
        };
      },
      wallets: function(wallets) {
        var _i, _len, data, wallet;
        data = void 0;
        wallet = void 0;
        _i = void 0;
        _len = void 0;
        data = [];
        _i = 0;
        _len = wallets.length;
        while (_i < _len) {
          wallet = wallets[_i];
          data.push(this.wallet(wallet));
          _i++;
        }
        return data;
      },
      payment: function(payment) {
        return {
          id: payment.id,
          wallet_id: payment.wallet_id,
          transaction_id: payment.transaction_id,
          address: payment.address,
          amount: payment.getFloat('amount'),
          currency: payment.currency,
          status: payment.status,
          updated_at: payment.updated_at,
          created_at: payment.created_at
        };
      },
      payments: function(payments) {
        var _i, _len, data, payment;
        data = void 0;
        payment = void 0;
        _i = void 0;
        _len = void 0;
        data = [];
        _i = 0;
        _len = payments.length;
        while (_i < _len) {
          payment = payments[_i];
          data.push(this.payment(payment));
          _i++;
        }
        return data;
      },
      transaction: function(transaction) {
        return {
          id: transaction.id,
          wallet_id: transaction.wallet_id,
          currency: transaction.currency,
          fee: transaction.getFloat('fee'),
          address: transaction.address,
          amount: transaction.getFloat('amount'),
          category: transaction.category,
          txid: transaction.txid,
          confirmations: transaction.confirmations,
          min_confirmations: transaction.network_confirmations,
          balance_loaded: transaction.balance_loaded,
          updated_at: transaction.updated_at,
          created_at: transaction.created_at
        };
      },
      transactions: function(transactions) {
        var _i, _len, data, transaction;
        data = void 0;
        transaction = void 0;
        _i = void 0;
        _len = void 0;
        data = [];
        _i = 0;
        _len = transactions.length;
        while (_i < _len) {
          transaction = transactions[_i];
          data.push(this.transaction(transaction));
          _i++;
        }
        return data;
      },
      order: function(order) {
        return {
          id: order.id,
          type: order.type,
          action: order.action,
          buy_currency: order.buy_currency,
          sell_currency: order.sell_currency,
          amount: order.getFloat('amount'),
          matched_amount: order.getFloat('matched_amount'),
          result_amount: order.getFloat('result_amount'),
          fee: order.getFloat('fee'),
          unit_price: order.getFloat('unit_price'),
          status: order.status,
          in_queue: order.in_queue,
          published: order.published,
          updated_at: order.updated_at,
          created_at: order.created_at
        };
      },
      orders: function(orders) {
        var _i, _len, data, order;
        data = void 0;
        order = void 0;
        _i = void 0;
        _len = void 0;
        data = [];
        _i = 0;
        _len = orders.length;
        while (_i < _len) {
          order = orders[_i];
          data.push(this.order(order));
          _i++;
        }
        return data;
      },
      orderLog: function(orderLog) {
        return {
          id: orderLog.id,
          order_id: orderLog.order_id,
          action: orderLog.order.action,
          buy_currency: orderLog.order.buy_currency,
          sell_currency: orderLog.order.sell_currency,
          matched_amount: orderLog.getFloat('matched_amount'),
          result_amount: orderLog.getFloat('result_amount'),
          fee: orderLog.getFloat('fee'),
          unit_price: orderLog.getFloat('unit_price'),
          active: orderLog.active,
          time: orderLog.time,
          status: orderLog.status,
          updated_at: orderLog.updated_at,
          created_at: orderLog.created_at
        };
      },
      orderLogs: function(orderLogs) {
        var _i, _len, data, orderLog;
        data = void 0;
        orderLog = void 0;
        _i = void 0;
        _len = void 0;
        data = [];
        _i = 0;
        _len = orderLogs.length;
        while (_i < _len) {
          orderLog = orderLogs[_i];
          data.push(this.orderLog(orderLog));
          _i++;
        }
        return data;
      },
      chatMessage: function(message, user) {
        var data, username;
        data = void 0;
        username = void 0;
        if (user === null) {
          user = {};
        }
        username = user.username;
        if (message.user !== null) {
          username = message.user.username;
        }
        return data = {
          id: message.id,
          message: message.message,
          created_at: message.created_at,
          updated_at: message.updated_at,
          username: username
        };
      },
      chatMessages: function(messages) {
        var _i, _len, data, message;
        data = void 0;
        message = void 0;
        _i = void 0;
        _len = void 0;
        data = [];
        _i = 0;
        _len = messages.length;
        while (_i < _len) {
          message = messages[_i];
          data.push(this.chatMessage(message));
          _i++;
        }
        return data;
      },
      marketStats: function(marketStats) {
        var stats, type;
        stats = void 0;
        type = void 0;
        for (type in marketStats) {
          type = type;
          stats = marketStats[type];
          stats.yesterday_price = stats.getFloat('yesterday_price');
          stats.last_price = stats.getFloat('last_price');
          stats.day_high = stats.getFloat('day_high');
          stats.day_low = stats.getFloat('day_low');
          stats.top_bid = stats.getFloat('top_bid');
          stats.top_ask = stats.getFloat('top_ask');
          stats.volume1 = stats.getFloat('volume1');
          stats.volume2 = stats.getFloat('volume2');
          stats.growth_ratio = stats.getFloat('growth_ratio');
        }
        return marketStats;
      },
      tradeStats: function(tradeStats) {
        var _i, _len, stats;
        stats = void 0;
        _i = void 0;
        _len = void 0;
        _i = 0;
        _len = tradeStats.length;
        while (_i < _len) {
          stats = tradeStats[_i];
          stats.open_price = stats.getFloat('open_price');
          stats.close_price = stats.getFloat('close_price');
          stats.high_price = stats.getFloat('high_price');
          stats.low_price = stats.getFloat('low_price');
          stats.volume = stats.getFloat('volume');
          _i++;
        }
        return tradeStats;
      },
      tradeStats_tradingView: function(tradeStats) {
        /*var stats, _i, _len;
        var result = {
          t: [],
          c: [],
          o: [],
          h: [],
          l: [],
          v: [],
          s: "ok"
        };

        for (_i = 0, _len = tradeStats.length; _i < _len; _i++) {
          stats = tradeStats[_i];
          stats.open_price = stats.getFloat("open_price");
          stats.close_price = stats.getFloat("close_price");
          stats.high_price = stats.getFloat("high_price");
          stats.low_price = stats.getFloat("low_price");
          stats.volume = stats.getFloat("volume");

          result.t.push(stats.start_time.getTime() / 1000);
          result.o.push(stats.open_price);
          result.h.push(stats.high_price);
          result.l.push(stats.low_price);
          result.c.push(stats.close_price);
          result.v.push(stats.volume);
        }
        return result;
        */
        var _i, _len, result, stats;
        stats = void 0;
        _i = void 0;
        _len = void 0;
        result = [];
        _i = 0;
        _len = tradeStats.length;
        while (_i < _len) {
          stats = tradeStats[_i];
          result.push({
            time: stats.start_time.getTime(),
            open: stats.getFloat('open_price'),
            close: stats.getFloat('close_price'),
            high: stats.getFloat('high_price'),
            volume: stats.getFloat('volume'),
            low: stats.getFloat('low_price')
          });
          _i++;
        }
        return result;
      },
      error: function(err, res, code, log) {
        var key, message, val;
        key = void 0;
        message = void 0;
        val = void 0;
        if (code === null) {
          code = 409;
        }
        if (log === null) {
          log = true;
        }
        if (log) {
          console.error(err);
        }
        if (res) {
          res.statusCode = code;
        }
        if (_.isObject(err)) {
          delete err.sql;
          if (res && err.code === 'ER_DUP_ENTRY') {
            return res.json({
              error: this.formatError('' + err)
            });
          }
        }
        message = '';
        if (_.isString(err)) {
          message = err;
        } else if (_.isObject(err)) {
          for (key in err) {
            key = key;
            val = err[key];
            if (_.isArray(val)) {
              message += '' + val.join(' ') + ' ';
            } else {
              message += '' + val + ' ';
            }
          }
        }
        if (res) {
          return res.json({
            error: this.formatError(message)
          });
        }
        return this.formatError(message);
      },
      formatError: function(message) {
        message = message.replace('Error: ER_DUP_ENTRY: ', '');
        message = message.replace(/for key.*$/, '');
        message = message.replace(/Duplicate entry/, 'Value already taken');
        message = message.replace('ConflictError ', '');
        return _str.trim(message);
      },
      marketSummary: function(marketStats) {
        var _i, _len, marketSummaryStats, stats, summary;
        marketSummaryStats = void 0;
        stats = void 0;
        summary = void 0;
        _i = void 0;
        _len = void 0;
        marketSummaryStats = [];
        _i = 0;
        _len = marketStats.length;
        while (_i < _len) {
          stats = marketStats[_i];
          summary = {
            'market_id': stats.id,
            'code': stats.label,
            'exchange': stats.exchange,
            'last_price': _str.toFixed(stats.getFloat('last_price')),
            'yesterday_price': _str.toFixed(stats.getFloat('yesterday_price')),
            'change': _str.toFixed(stats.getFloat('growth_ratio'), 2),
            '24hhigh': _str.toFixed(stats.getFloat('day_high')),
            '24hlow': _str.toFixed(stats.getFloat('day_low')),
            '24hvol': _str.toFixed(stats.getFloat('volume1'), 3),
            'top_bid': _str.toFixed(stats.getFloat('top_bid')),
            'top_ask': _str.toFixed(stats.getFloat('top_ask'))
          };
          marketSummaryStats.push(summary);
          _i++;
        }
        return marketSummaryStats;
      },
      lastTrades: function(orderLogs) {
        var _i, _len, orderLog, result, trade;
        orderLog = void 0;
        result = void 0;
        trade = void 0;
        _i = void 0;
        _len = void 0;
        result = {};
        result.count = orderLogs.length;
        result.trades = [];
        _i = 0;
        _len = orderLogs.length;
        while (_i < _len) {
          orderLog = orderLogs[_i];
          trade = {};
          trade.type = orderLog.order.action === 'buy' ? 0 : 1;
          trade.amount = _str.toFixed(orderLog.getFloat('matched_amount'));
          trade.price = _str.toFixed(orderLog.getFloat('unit_price'));
          trade.total = _str.toFixed(orderLog.getFloat('total'));
          trade.time = orderLog.time;
          result.trades.push(trade);
          _i++;
        }
        return result;
      },
      lastOrders: function(action, orders) {
        var _i, _len, lastOrder, order, result;
        lastOrder = void 0;
        order = void 0;
        result = void 0;
        _i = void 0;
        _len = void 0;
        result = {};
        result.count = orders.length;
        result.type = action.toUpperCase();
        result.orders = [];
        _i = 0;
        _len = orders.length;
        while (_i < _len) {
          order = orders[_i];
          lastOrder = {};
          lastOrder.price = _str.toFixed(order.getFloat('unit_price'));
          lastOrder.amount = _str.toFixed(order.getFloat('amount'));
          lastOrder.total = _str.toFixed(order.getFloat('total'));
          result.orders.push(lastOrder);
          _i++;
        }
        return result;
      },
      chartData: function(tradeStats) {
        var _i, _len, periodStat, result, stat;
        periodStat = void 0;
        result = void 0;
        stat = void 0;
        _i = void 0;
        _len = void 0;
        result = [];
        _i = 0;
        _len = tradeStats.length;
        while (_i < _len) {
          periodStat = tradeStats[_i];
          stat = {};
          stat.date = periodStat.start_time;
          stat.open = _str.toFixed(periodStat.getFloat('open_price'));
          stat.close = _str.toFixed(periodStat.getFloat('close_price'));
          stat.high = _str.toFixed(periodStat.getFloat('high_price'));
          stat.low = _str.toFixed(periodStat.getFloat('low_price'));
          stat.coin_volume = _str.toFixed(periodStat.getFloat('volume'));
          stat.exchange_volume = _str.toFixed(periodStat.getFloat('exchange_volume'));
          result.push(stat);
          _i++;
        }
        return result;
      }
    };
    exports = module.exports = JsonRenderer;
  }).call(this);

  // ---
// generated by js2coffee 2.2.0

}).call(this);
