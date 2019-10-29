(function() {
  var Emailer, ipFormatter;

  require("date-utils");

  ipFormatter = require("ip");

  Emailer = require("../lib/emailer");

  module.exports = function(sequelize, DataTypes) {
    var AuthStats;
    AuthStats = sequelize.define("AuthStats", {
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      ip: {
        type: DataTypes.INTEGER,
        allowNull: true,
        set: function(ip) {
          return this.setDataValue("ip", ipFormatter.toLong(ip));
        },
        get: function() {
          return ipFormatter.fromLong(this.getDataValue("ip"));
        }
      }
    }, {
      tableName: "auth_stats",
      classMethods: {
        findByUser: function(userId, callback = function() {}) {
          return AuthStats.findAll({
            where: {
              user_id: userId
            }
          }).complete(callback);
        },
        log: function(data, sendByMail = true, callback = function() {}) {
          var stats;
          stats = {
            user_id: data.user.id,
            ip: data.ip
          };
          return AuthStats.create(stats).complete(function(err, authStats) {
            if (sendByMail) {
              AuthStats.sendUserLoginNotice(authStats, data.user.email);
            }
            return callback(err, stats);
          });
        },
        sendUserLoginNotice: function(stats, email, callback = function() {}) {
          var data, emailer, options;
          data = {
            ip: stats.ip || "unknown",
            auth_date: stats.created_at.toFormat("MMMM D, YYYY at HH24:MI"),
            email: email
          };
          options = {
            to: {
              email: email
            },
            subject: "Login on Separdaz.com",
            template: "user_login_notice"
          };
          emailer = new Emailer(options, data);
          emailer.send(function(err, result) {
            if (err) {
              return console.error(err);
            }
          });
          return callback();
        }
      }
    });
    return AuthStats;
  };

}).call(this);
