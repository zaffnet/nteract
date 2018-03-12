const path = require("path");
const configurator = require("@nteract/webpack-configurator");

const webpack = require("webpack");

function webpackConfig(_config, options) {
  const config = configurator.nextWebpack(_config, options);

  if (options.isServer) {
    config.plugins.push(
      new webpack.ProvidePlugin({
        XMLHttpRequest: ["xmlhttprequest", "XMLHttpRequest"],
        "root.XMLHttpRequest": ["xmlhttprequest", "XMLHttpRequest"],
        "global.XMLHttpRequest": ["xmlhttprequest", "XMLHttpRequest"],
        "window.XMLHttpRequest": ["xmlhttprequest", "XMLHttpRequest"]
      })
    );
  } else {
  }

  return config;
}

module.exports = {
  webpack: webpackConfig
};
