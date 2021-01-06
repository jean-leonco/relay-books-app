const { createTransformer } = require('babel-jest');

const { common } = require('@workspace/babel');

module.exports = createTransformer(common);
