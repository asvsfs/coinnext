(function() {
  var BtcWallet, _, exports, trTime, transactionData, transactionDetails, transactionsData;

  _ = require("underscore");

  trTime = Date.now() / 1000;

  transactionData = {
    amount: 1,
    txid: "unique_tx_id",
    confirmations: 6,
    time: trTime,
    details: []
  };

  transactionDetails = {
    account: "account",
    fee: 0.0001,
    address: "address",
    category: "receive"
  };

  transactionsData = {
    amount: 1,
    txid: "unique_tx_id",
    confirmations: 6,
    time: trTime,
    account: "account",
    fee: 0.0001,
    address: "address",
    category: "receive"
  };

  BtcWallet = (function() {
    class BtcWallet {
      getTransaction(txId, callback) {
        var tr;
        tr = _.clone(transactionData);
        tr.details = [_.clone(transactionDetails)];
        return callback(null, tr);
      }

      getTransactions(account = "*", limit = 100, from = 0, callback) {
        return callback(null, [_.clone(transactionsData)]);
      }

      getBalance(account, callback) {
        return callback(null, 1);
      }

      chargeAccount(account, balance, callback) {
        return callback(null, true);
      }

      sendToAddress(address, amount, callback) {
        return callback(null, `unique_tx_id_${address}`);
      }

      isBalanceConfirmed(existentConfirmations) {
        return existentConfirmations >= this.confirmations;
      }

    };

    BtcWallet.prototype.confirmations = 6;

    return BtcWallet;

  }).call(this);

  exports = module.exports = BtcWallet;

}).call(this);
