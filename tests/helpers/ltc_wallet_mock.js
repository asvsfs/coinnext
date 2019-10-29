(function() {
  var LtcWallet, exports, trTime, transactionData;

  trTime = Date.now() / 1000;

  transactionData = {
    amount: 1,
    txid: "unique_tx_id",
    confirmations: 6,
    time: trTime,
    details: [
      {
        account: "account",
        fee: 0.0001,
        address: "address",
        category: "receive"
      }
    ]
  };

  LtcWallet = class LtcWallet {
    getTransaction(txId, callback) {
      return callback(null, transactionData);
    }

    getBalance(account, callback) {
      return callback(null, 1);
    }

    chargeAccount(account, balance, callback) {
      return callback(null, true);
    }

    sendToAddress(address, account, amount, callback) {
      return callback(null, "unique_tx_id");
    }

  };

  exports = module.exports = LtcWallet;

}).call(this);
