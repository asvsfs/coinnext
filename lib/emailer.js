(function() {
  var Emailer, _, emailer, exports, fs;

  emailer = require("nodemailer");

  fs = require("fs");

  _ = require("underscore");

  Emailer = (function() {
    class Emailer {
      constructor(options, data1) {
        this.options = options;
        this.data = data1;
        this.setUrls();
      }

      send(callback) {
        var attachments, html, messageData, transport;
        html = this.getHtml(this.options.template, this.data);
        attachments = this.getAttachments(html);
        messageData = {
          to: this.options.to.email,
          from: global.appConfig().emailer.from,
          subject: this.options.subject,
          html: html,
          generateTextFromHTML: true,
          attachments: attachments
        };
        transport = this.getTransport();
        if (!global.appConfig().emailer.enabled) {
          return callback();
        }
        return transport.sendMail(messageData, callback);
      }

      getTransport() {
        return emailer.createTransport(global.appConfig().emailer.transport);
      }

      getHtml(templateName, data) {
        var encoding, templateContent, templatePath;
        templatePath = `./views/emails/${templateName}.html`;
        templateContent = fs.readFileSync(templatePath, encoding = "utf8");
        return _.template(templateContent, data, {
          interpolate: /\{\{(.+?)\}\}/g
        });
      }

      getAttachments(html) {
        var attachment, attachments, i, len, ref;
        attachments = [];
        ref = this.attachments;
        for (i = 0, len = ref.length; i < len; i++) {
          attachment = ref[i];
          if (html.search(`cid:${attachment.cid}`) > -1) {
            attachments.push(attachment);
          }
        }
        return attachments;
      }

      setUrls() {
        this.data.site_url = global.appConfig().emailer.host || this.data.site_url;
        this.data.img_path = (global.appConfig().assets_host || this.data.site_url) + "/img/email";
        return this.data.img_version = global.appConfig().assets_key ? `?v=${(global.appConfig().assets_key)}` : "";
      }

    };

    Emailer.prototype.options = {};

    Emailer.prototype.data = {};

    Emailer.prototype.attachments = [];

    return Emailer;

  }).call(this);

  exports = module.exports = Emailer;

}).call(this);
