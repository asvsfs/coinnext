(function() {
  var all, create, exports, mathjs;

  ({create, all} = require('mathjs'));

  mathjs = create(all);

  mathjs.config({
    number: 'BigNumber',
    precision: 64
  });

  exports = module.exports = mathjs;

}).call(this);
