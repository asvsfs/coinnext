(function() {
  var _str, exports;

  _str = require("underscore.string");

  _str.roundTo = function(number, decimals = 8) {
    var multiplier;
    multiplier = Math.pow(10, decimals);
    return Math.round(parseFloat(number) * multiplier) / multiplier;
  };

  _str.satoshiRound = function(number) {
    return _str.roundTo(number, 8);
  };

  _str.toFixed = function(number, decimals = 8) {
    return parseFloat(number).toFixed(decimals);
  };

  exports = module.exports = _str;

}).call(this);
