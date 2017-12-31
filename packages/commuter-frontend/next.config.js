module.exports = {
  webpack: config => {
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== "UglifyJsPlugin"
    );
    return config;
  }
};
