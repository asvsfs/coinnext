(function() {
  var CryptoWallet, DogeWallet, exports;

  CryptoWallet = require("../crypto_wallet");

  DogeWallet = class DogeWallet extends CryptoWallet {
    getBalance(account, callback) {
      return this.client.getBalance(account, (err, balance) => {
        balance = balance.result != null ? balance.result : balance;
        balance = this.convert(this.initialCurrency, this.currency, balance);
        if (callback) {
          return callback(err, balance);
        }
      });
    }

  };

  exports = module.exports = DogeWallet;

}).call(this);
