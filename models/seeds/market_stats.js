(function() {
  var MarketHelper, int, literal, markets, ref;

  MarketHelper = require("../../lib/market_helper");

  markets = [];

  ref = MarketHelper.getMarkets();
  for (literal in ref) {
    int = ref[literal];
    markets.push({
      type: literal,
      status: "enabled"
    });
  }

  module.exports = markets;

}).call(this);
