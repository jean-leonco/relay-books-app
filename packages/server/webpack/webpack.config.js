const path = require('path');

const nodeExternals = require('webpack-node-externals');

const cwd = process.cwd();

export const outputPath = path.join(cwd, '.webpack');
export const outputFilename = 'bundle.js';

export default {
  context: cwd,
  mode: 'development',
  target: 'node',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: outputPath,
    filename: outputFilename,
    pathinfo: false,
    futureEmitAssets: true,
  },
  optimization: {
    splitChunks: false,
    removeEmptyChunks: false,
    removeAvailableModules: false,
  },
  externals: [
    nodeExternals({
      allowlist: [/@booksapp/],
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      allowlist: [/@booksapp/],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        use: {
          loader: 'babel-loader?cacheDirectory',
        },
        exclude: [/node_modules/, path.resolve(__dirname, '.webpack')],
      },
    ],
  },
  plugins: [],
  node: {
    __dirname: false,
    __filename: false,
    fs: 'empty',
  },
};
