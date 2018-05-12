var fs = require('fs');
var environment = process.env.NODE_ENV || 'test';
var config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json', encoding='utf8'))[environment];

global.appConfig = function () {return config;};
global.db = require('./../../models/index');
global.queue = require('./../../lib/queue/index');

module.exports.should = require("should");