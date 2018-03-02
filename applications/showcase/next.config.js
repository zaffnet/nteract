const configurator = require("@nteract/webpack-configurator");

module.exports = {
  webpack: (config, { buildId, dev }) => {
    config.module.rules.push({
      test: /\.js$/,
      exclude: configurator.exclude,
      loader: "babel-loader"
    });

    config.resolve = Object.assign({}, config.resolve, {
      mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
      alias: configurator.mergeDefaultAliases(config.resolve.alias)
    });
    return config;
  }
};
