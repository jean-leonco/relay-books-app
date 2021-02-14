const { server } = require('@workspace/webpack');

module.exports = {
  ...server,
  mode: 'production', // Tells webpack to use its built-in optimizations for production
};
