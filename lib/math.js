

(function() {
  var exports;
  var math = require('mathjs');
  math.config({
    number: 'BigNumber',  // Default type of number:
                          // 'number' (default), 'BigNumber', or 'Fraction'
    precision: 20         // Number of significant digits for BigNumbers
  });
  
  exports = module.exports = math;

}).call(this);
