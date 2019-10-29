(function() {
  var AuthStats, JsonRenderer, MarketHelper, MarketStats, OrderLog, TradeStats, UserToken, Wallet, WalletHealth, _, _str;

  Wallet = global.db.Wallet;

  WalletHealth = global.db.WalletHealth;

  MarketStats = global.db.MarketStats;

  TradeStats = global.db.TradeStats;

  AuthStats = global.db.AuthStats;

  UserToken = global.db.UserToken;

  OrderLog = global.db.OrderLog;

  JsonRenderer = require("../lib/json_renderer");

  MarketHelper = require("../lib/market_helper");

  _str = require("../lib/underscore_string");

  _ = require("underscore");

  module.exports = function(app) {
    app.get("/", function(req, res) {
      return MarketStats.getStats(function(err, marketStats) {
        return OrderLog.getNumberOfTrades(null, function(err, tradesCount) {
          return res.render("site/index", {
            title: req.user ? 'Home - Separdaz' : 'Separdaz - Cryptocurrency Exchange',
            page: "home",
            user: req.user,
            marketStats: JsonRenderer.marketStats(marketStats),
            currencies: MarketHelper.getCurrencyNames(),
            tradesCount: tradesCount,
            _str: _str
          });
        });
      });
    });
    app.get("/trade", function(req, res) {
      return res.redirect("/trade/LTC/BTC");
    });
    app.get("/trade/:currency1/:currency2", function(req, res) {
      var currency1, currency2;
      currency1 = req.params.currency1;
      currency2 = req.params.currency2;
      if (!MarketHelper.isValidCurrency(currency1) || !MarketHelper.isValidCurrency(currency2)) {
        return res.redirect("/");
      }
      return MarketStats.getStats(function(err, marketStats) {
        if (!marketStats[`${currency1}_${currency2}`]) {
          return res.redirect("/404");
        }
        if (req.user) {
          return Wallet.findUserWalletByCurrency(req.user.id, currency1, function(err, wallet1) {
            if (!wallet1) {
              wallet1 = Wallet.build({
                currency: currency1
              });
            }
            return Wallet.findUserWalletByCurrency(req.user.id, currency2, function(err, wallet2) {
              if (!wallet2) {
                wallet2 = Wallet.build({
                  currency: currency2
                });
              }
              return res.render("site/trade", {
                title: `Trade ${MarketHelper.getCurrencyName(currency1)} to ${MarketHelper.getCurrencyName(currency2)} ${currency1}/${currency2} - Separdaz`,
                page: "trade",
                user: req.user,
                currency1: currency1,
                currency2: currency2,
                wallet1: wallet1,
                wallet2: wallet2,
                currencies: MarketHelper.getCurrencyNames(),
                marketStats: JsonRenderer.marketStats(marketStats),
                _str: _str
              });
            });
          });
        } else {
          return res.render("site/trade", {
            title: `Trade ${MarketHelper.getCurrencyName(currency1)} to ${MarketHelper.getCurrencyName(currency2)} ${currency1}/${currency2} - Separdaz - Cryptocurrency Exchange`,
            page: "trade",
            currency1: currency1,
            currency2: currency2,
            wallet1: Wallet.build({
              currency: currency1
            }),
            wallet2: Wallet.build({
              currency: currency2
            }),
            currencies: MarketHelper.getCurrencyNames(),
            marketStats: JsonRenderer.marketStats(marketStats),
            _str: _str
          });
        }
      });
    });
    app.get("/funds", function(req, res) {
      if (!req.user) {
        return res.redirect("/login");
      }
      return Wallet.findUserWallets(req.user.id, function(err, wallets = []) {
        return MarketStats.findRemovedCurrencies(function(err, removedCurrencies) {
          var currencies;
          wallets = wallets.filter(function(wl) {
            return removedCurrencies.indexOf(wl.currency) === -1;
          });
          currencies = MarketHelper.getSortedCurrencyNames();
          currencies = _.omit(currencies, removedCurrencies);
          return res.render("site/funds", {
            title: 'Funds - Separdaz',
            page: "funds",
            user: req.user,
            wallets: wallets,
            currencies: currencies,
            _str: _str
          });
        });
      });
    });
    app.get("/funds/:currency", function(req, res) {
      if (!req.user) {
        return res.redirect("/login");
      }
      return MarketStats.findRemovedCurrencies(function(err, removedCurrencies) {
        if (removedCurrencies.indexOf(req.params.currency) > -1) {
          return res.redirect("/404");
        }
        return Wallet.findUserWallets(req.user.id, function(err, wallets) {
          return Wallet.findUserWalletByCurrency(req.user.id, req.params.currency, function(err, wallet) {
            var currencies;
            if (err) {
              console.error(err);
            }
            if (!wallet) {
              return res.redirect("/");
            }
            wallets = wallets.filter(function(wl) {
              return removedCurrencies.indexOf(wl.currency) === -1;
            });
            currencies = MarketHelper.getSortedCurrencyNames();
            currencies = _.omit(currencies, removedCurrencies);
            return res.render("site/funds/wallet", {
              title: `${req.params.currency} - Funds - Separdaz`,
              page: "funds",
              user: req.user,
              wallets: wallets,
              wallet: wallet,
              currencies: currencies,
              _str: _str
            });
          });
        });
      });
    });
    app.get("/market_stats", function(req, res) {
      return MarketStats.getStats(function(err, marketStats) {
        return res.json(JsonRenderer.marketStats(marketStats));
      });
    });
    app.get("/trade_stats/:market_type", function(req, res) {
      return TradeStats.getLastStats(req.params.market_type, function(err, tradeStats = []) {
        return res.json(JsonRenderer.tradeStats(tradeStats));
      });
    });
    // Settings
    //app.get "/settings", (req, res)->
    //  return res.redirect "/login"  if not req.user
    //  res.render "site/settings/settings",
    //    title: 'Settings'
    //    page: 'settings'
    //    user: req.user
    app.get("/settings/preferences", function(req, res) {
      if (!req.user) {
        return res.redirect("/login");
      }
      return res.render("site/settings/preferences", {
        title: 'Preferences - Settings - Separdaz',
        page: 'settings',
        user: req.user
      });
    });
    app.get("/settings/security", function(req, res) {
      if (!req.user) {
        return res.redirect("/login");
      }
      return AuthStats.findByUser(req.user.id, function(err, authStats) {
        return UserToken.findByUserAndType(req.user.id, "google_auth", function(err, googleToken) {
          return res.render("site/settings/security", {
            title: 'Security - Settings - Separdaz',
            page: 'settings',
            user: req.user,
            authStats: authStats,
            googleToken: googleToken
          });
        });
      });
    });
    // Status
    app.get("/status", function(req, res) {
      return WalletHealth.findAll().complete(function(err, wallets) {
        var sortedWallets;
        sortedWallets = _.sortBy(wallets, function(w) {
          return w.currency;
        });
        return res.render("site/status", {
          title: 'Status - Separdaz',
          page: "status",
          wallets: sortedWallets
        });
      });
    });
    // Static Pages
    app.get("/legal/terms", function(req, res) {
      return res.render("static/terms", {
        title: 'Terms - Separdaz',
        user: req.user
      });
    });
    app.get("/legal/privacy", function(req, res) {
      return res.render("static/privacy", {
        title: 'Privacy - Separdaz',
        user: req.user
      });
    });
    app.get("/legal/cookie", function(req, res) {
      return res.render("static/cookie", {
        title: 'Cookie - Separdaz',
        user: req.user
      });
    });
    app.get("/fees", function(req, res) {
      return res.render("static/fees", {
        title: 'Fees - Separdaz',
        user: req.user,
        MarketHelper: MarketHelper
      });
    });
    app.get("/security", function(req, res) {
      return res.render("static/security", {
        title: 'Security - Separdaz',
        user: req.user
      });
    });
    return app.get("/api", function(req, res) {
      return res.render("static/api", {
        title: 'API - Separdaz',
        user: req.user
      });
    });
  };

}).call(this);
