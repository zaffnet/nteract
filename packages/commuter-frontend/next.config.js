const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
module.exports = {
  webpack: config => {
    for (let index = 0; index < config.plugins.length; index += 1) {
      if (config.plugins[index].constructor.name === "UglifyJsPlugin") {
        // Delete the UglifyJS plugin
        // And add uglify-es plugin (https://github.com/webpack-contrib/uglifyjs-webpack-plugin)
        config.plugins.splice(
          index,
          1,
          new UglifyJSPlugin({
            sourceMap: false,
            parallel: true
          })
        );
        break;
      }
    }
    return config;
  }
};
