var plugin = function(){
  return function(style){
    style.define("CDN", function(imgOptions) {
      var host = global.appConfig().assets_host || "";
      var glueSign = imgOptions.string.indexOf("?") > -1 ? "&" : "?";
      var key = global.appConfig().assets_key ? glueSign + "_=" + global.appConfig().assets_key : "";
      return host + imgOptions.string + key;
    });
  };
};
module.exports = plugin;