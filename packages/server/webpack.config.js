const path = require('path');

const { HotModuleReplacementPlugin } = require('webpack');

const { ReloadServerPlugin } = require('@workspace/webpack');

const common = require('./webpack.common');

module.exports = {
  ...common,
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  entry: {
    server: ['./src/index.ts'],
  },
  watch: true,
  plugins: [
    new ReloadServerPlugin({
      script: path.resolve('build', 'server.js'),
    }),
    new HotModuleReplacementPlugin(),
  ],
};
