const path = require('path');

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  devtool: 'cheap-eval-source-map',
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  externals: [{ 'aws-sdk': 'aws-sdk' }],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx', '.json', '.mjs'],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    library: 'index',
    libraryTarget: 'commonjs2',
    pathinfo: false,
    futureEmitAssets: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
      __DEV__: process.env.NODE_ENV !== 'production',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.([jt]sx?)$/,
        loader: 'babel-loader',
        options: {
          configFile: './babel.config.js',
        },
        exclude: /node_modules/,
      },
    ],
  },
};
