const path = require('path');

const WebpackNodeExternals = require('webpack-node-externals');

const cwd = process.cwd();

module.exports = {
  target: 'node',
  stats: 'errors-only',
  node: {
    __dirname: true,
  },
  output: {
    path: path.resolve('build'),
    filename: 'server.js',
  },
  externals: [
    WebpackNodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
      allowlist: [/@workspace/],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'],
  },
  module: {
    rules: [
      // Js modules: use javascript since we don't need to transpile it
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },

      // Typescript and Javascript: Transpile and load using babel-loader
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        use: { loader: 'babel-loader' },
        exclude: [/node_modules/],
        include: [path.join(cwd, 'src'), path.join(cwd, '../')],
      },
    ],
  },
};
