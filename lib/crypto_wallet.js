(function() {
  var CryptoWallet, coind, exports;

  coind = require("node-coind");

  CryptoWallet = (function() {
    class CryptoWallet {
      constructor(options) {
        if (!options) {
          options = this.loadOptions();
        }
        this.createClient(options);
        this.setupCurrency(options);
        this.setupConfirmations(options);
        this.setupWallet(options);
      }

      createClient(options) {
        if (options.client.sslCa) {
          options.client.sslCa = this.loadCertificate(options.client.sslCa);
        }
        return this.client = new coind.Client(options.client);
      }

      setupCurrency(options) {
        this.currency = options.currency;
        this.initialCurrency = options.initialCurrency || this.currency;
        return this.currencyName = options.currencyName;
      }

      setupConfirmations(options) {
        return this.confirmations = options.confirmations || this.confirmations;
      }

      setupWallet(options) {
        this.account = options.wallet.account;
        this.address = options.wallet.address;
        return this.passphrase = options.wallet.passphrase;
      }

      generateAddress(account, callback) {
        return this.submitPassphrase((err) => {
          if (err) {
            console.error(err);
          }
          return this.client.getNewAddress(account, callback);
        });
      }

      sendToAddress(address, amount, callback) {
        amount = this.convert(this.currency, this.initialCurrency, amount);
        return this.submitPassphrase((err) => {
          if (err) {
            console.error(err);
          }
          return this.client.sendToAddress(address, amount, callback);
        });
      }

      submitPassphrase(callback) {
        if (!this.passphrase) {
          return callback();
        }
        return this.client.walletPassphrase(this.passphrase, this.passphraseTimeout, callback);
      }

      convert(fromCurrency, toCurrency, amount) {
        var ref;
        if ((ref = this.convertionRates) != null ? ref[`${fromCurrency}_${toCurrency}`] : void 0) {
          return parseFloat(parseFloat(amount * this.convertionRates[`${fromCurrency}_${toCurrency}`]).toFixed(8));
        }
        return parseFloat(parseFloat(amount).toFixed(8));
      }

      getInfo(callback) {
        return this.client.getInfo(callback);
      }

      getBlockCount(callback) {
        return this.client.getBlockCount(callback);
      }

      getBlockHash(blockIndex, callback) {
        return this.client.getBlockHash(blockIndex, callback);
      }

      getBlock(blockHash, callback) {
        return this.client.getBlock(blockHash, callback);
      }

      getBestBlockHash(callback) {
        return this.getBlockCount((err, blockCount) => {
          return this.getBlockHash(blockCount - 1, callback);
        });
      }

      getBestBlock(callback) {
        return this.getBestBlockHash((err, blockHash) => {
          return this.getBlock(blockHash, callback);
        });
      }

      getTransactions(account = "*", count = 10, from = 0, callback) {
        return this.client.listTransactions(account, count, from, callback);
      }

      getTransaction(txId, callback) {
        return this.client.getTransaction(txId, callback);
      }

      getBalance(account, callback) {
        return this.client.getBalance(account, (err, balance) => {
          balance = this.convert(this.initialCurrency, this.currency, balance);
          if (callback) {
            return callback(err, balance);
          }
        });
      }

      getBankBalance(callback) {
        return this.getBalance("*", callback);
      }

      isBalanceConfirmed(existentConfirmations) {
        return existentConfirmations >= this.confirmations;
      }

      loadOptions() {
        return global.appConfig().wallets[this.initialCurrency.toLowerCase()];
      }

      loadCertificate(path) {
        return require("fs").readFileSync(`${__dirname}/../${path}`);
      }

    };

    CryptoWallet.prototype.confirmations = null;

    CryptoWallet.prototype.address = null;

    CryptoWallet.prototype.account = null;

    CryptoWallet.prototype.passphrase = null;

    CryptoWallet.prototype.passphraseTimeout = 5;

    CryptoWallet.prototype.currency = null;

    CryptoWallet.prototype.initialCurrency = null;

    CryptoWallet.prototype.currencyName = null;

    CryptoWallet.prototype.convertionRates = {};

    return CryptoWallet;

  }).call(this);

  exports = module.exports = CryptoWallet;

}).call(this);
