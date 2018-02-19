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
  "@nteract/transforms": "@nteract/transforms/src",
  "@nteract/transform-vdom": "@nteract/transform-vdom/src",
  "@nteract/transform-model-debug": "@nteract/transform-model-debug/src",
  "rx-jupyter": "rx-jupyter/src",
  "rx-binder": "rx-binder/src",
  ...rxAliases
};

module.exports = {
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
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(@nteract|rx-jupyter|rx-binder))/,
        loader: "babel-loader"
      },
      { test: /\.json$/, loader: "json-loader" }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "module", "main"],
    extensions: [".js", ".jsx"],
    alias: aliases
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.IgnorePlugin(/\.(css|less)$/),

    // build vendor bundle (including common code chunks used in other bundles)
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
      filename: "vendor.js"
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      compress: {
        warnings: false,
        pure_getters: true,
        passes: 3,
        screw_ie8: true,
        sequences: false
      },
      output: { comments: false, beautify: true },
      sourceMap: false
    }),

    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
};
