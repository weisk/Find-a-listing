var fs = require('fs');
var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: path.resolve(__dirname, 'server.js'),
  output: {
    filename: 'server.bundle.js',
  },
  target: 'node',
  resolve: {
      alias: {
          'webpackjson': '/bin/webpack.json',
      },
  },
  externals: [
      nodeExternals(),
      {
          'webpackjson': 'require("./bin/webpack.json")'
      }
  ],
  node: {
    __filename: false,
    __dirname: false,
  },
  module: {
    loaders: [
      {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
      },
    ]
  }
};
