const path = require('path');

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReloadServerPlugin = require('reload-server-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  entry: {
    graphql: './src/graphql/index.ts',
  },
  watch: true,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReloadServerPlugin({
      script: path.resolve('build', 'graphql.js'),
    }),
  ],
});
