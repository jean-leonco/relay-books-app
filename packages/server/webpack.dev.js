const { HotModuleReplacementPlugin } = require('webpack');

const { server, ReloadServerPlugin } = require('@workspace/webpack');

module.exports = {
  ...server,
  mode: 'development', // Tells webpack to use its built-in optimizations for development.
  devtool: 'eval-cheap-source-map', // Choose a style of source mapping to enhance the debugging process.
  watch: true, // Tells webpack to continue to watch for changes in any of the resolved files.
  plugins: [
    ...server.plugins,
    new ReloadServerPlugin({}), // Automatically (re)start server between builds.
    new HotModuleReplacementPlugin(), // HMR exchanges, adds, or removes modules while an application is running, without a full reload.
  ],
};
