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
    app.get('/config', (req,res)=>{
      // supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
      res.json({
        supported_resolutions: ['30'],
        supports_group_request: false,
        supports_marks: false,
        supports_search: true,
        supports_timescale_marks: false,
      })
    })

    app.get("/symbol_info", (req, res)=>{
      console.log('symbol info')
    });

    /**
     * GET /symbols?symbol=AAL, GET /symbols?symbol=NYSE:MSFT
     */
    app.get('/symbols', (req,res)=>{

      res.json({
        "name":"LTC_BTC",
        "exchange-traded": "SEPARDAZ",
        "exchange-listed": "SEPARDAZ",
        "timezone": "Asia/Tehran",
        "minmov": 1,
        "minmov2": 0,
        "pointvalue": 1,
        "fractional":true,
        "has_intraday": true,
        "has_no_volume":false,
        // "has_seconds":true,
        "has_empty_bars":true,
        "session-regular":"0000-2400|0000-2400:1|0000-2400:7",
        "description": "LTC_BTC",
        "type": "crypto",
        "supported_resolutions": ['30'],
        "pricescale": 100,
      });

    })

    /**
     * GET /search?query=<query>&type=<type>&exchange=<exchange>&limit=<limit>
     */
    app.get('/search', (req,res)=>{
      console.log('search')
    })

    /**
     * GET /history?symbol=<ticker_name>&from=<unix_timestamp>&to=
     * GET /history?symbol=BEAM~0&resolution=D&from=1386493512&to=1395133512
     */
    app.get('/history', (req,res)=>{
      console.log('history')
      
      let symbol = req.query.symbol;
      let resolution = req.query.resolution;
      let from = req.query.from;
      let to = req.query.to;
      let tt = 1526214860;
    //   return res.json({
    //     s: "ok",
    //     t: [tt+30, tt+(30*60), tt+(30*60*2), tt+(30*60*3)],
    //     c: [42.1, 43.4, 44.3, 42.8],
    //     o: [41.0, 42.9, 43.7, 44.5],
    //     h: [43.0, 44.1, 44.8, 44.5],
    //     l: [40.4, 42.1, 42.8, 42.3],
    //     v: [12000, 18500, 24000, 45000]
    //  })


      return TradeStats.findByTime({
        marketId : 1,
        startTime : from,
        endTime : to
        
      }, function(err, tradeStats) {
        if (tradeStats == null) {
          tradeStats = [];
        }
        return res.json(JsonRenderer.tradeStats_tradingView(tradeStats));
      });
    })

    /**
     * GET /marks?symbol=<ticker_name>&from=<unix_timestamp>&to=
     */
    app.get('/marks', (req,res)=>{
      console.log('hey')
    })

    app.get('/timescale_marks', (req,res)=>{
      console.log('hey')
    })

    return app.get('/quotes', (req,res)=>{
      console.log('hey')
    })
    
  };

}).call(this);
