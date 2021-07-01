const config = require('./webpack.config');

/** @type {import('webpack').Configuration} */
module.exports = {
  ...config,
  mode: 'production', // Tells webpack to use its built-in optimizations for production
};
