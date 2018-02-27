const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

const rxPathMapping = require("rxjs/_esm5/path-mapping");

const rxAliases = rxPathMapping();
const aliases = {
  "@nteract/transform-vdom": "@nteract/transform-vdom/src",
  "@nteract/transforms": "@nteract/transforms/src",
  "@nteract/markdown": "@nteract/markdown/src",
  "@nteract/mathjax": "@nteract/mathjax/src",
  "@nteract/core": "@nteract/core/src",
  "@nteract/messaging": "@nteract/messaging/src",
  "@nteract/editor": "@nteract/editor/src",
  "@nteract/commutable": "@nteract/commutable/src",
  "@nteract/dropdown-menu": "@nteract/dropdown-menu/src",
  "@nteract/transform-model-debug": "@nteract/transform-model-debug/src",
  "rx-jupyter": "rx-jupyter/src",
  "rx-binder": "rx-binder/src",
  ...rxAliases
};

module.exports = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
  entry: {
    app: "./app/index.js",
    vendor: [
      "react",
      "react-dom",
      "react-redux",
      "redux",
      "redux-observable",
      "immutable",
      "rxjs",
      "jquery"
    ]
  },
  target: "web",
  output: {
    path: path.join(__dirname, "lib"),
    filename: "[name].js",
    chunkFilename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(@nteract|rx-jupyter|rx-binder))/,
        loader: "babel-loader"
      }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "module", "main"],
    extensions: [".js", ".jsx"],
    alias: aliases
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),

    new webpack.IgnorePlugin(/\.(css|less)$/),

    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
};
