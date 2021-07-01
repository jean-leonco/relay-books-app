const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackBar = require('webpackbar');

const cwd = process.cwd();

const src = path.resolve(cwd, 'src');

let workspaces = []; // Workspaces that should be bundled/watched by webpack.
workspaces = workspaces.map((pkg) => path.resolve(cwd, '..', pkg)); // Transform workspace name into absolute path.

/** @type {import('webpack').Configuration} */
module.exports = {
  context: cwd, // The base directory for resolving entry points and loaders from configuration.
  target: 'node', // Instructs webpack to target a specific environment.
  stats: 'errors-only', // Control what bundle information gets displayed.
  node: {
    __dirname: true, // Polyfill global __dirname. Without this, calling __dirname would return an absolute path pointing to the output dir.
  },
  entry: {
    server: path.resolve(src, 'index.ts'), // The point where to start the application bundling process.
  },
  output: {
    path: path.resolve(cwd, 'build'), // The path where all compiled files are written.
    filename: 'index.js', // The single output file generated name.
  },
  externalsPresets: { node: true }, // Treat node.js built-in modules like fs, path or vm as external and load them via require() when used.
  externals: [
    // Prevent bundling node_modules. This improves build time and bundle size.
    nodeExternals({
      // Workspace node_modules. `root/workspaces/server/node_modules`.
      allowlist: [/@workspace/], // An array for the externals to allow, so they will be included in the bundle.
    }),
    nodeExternals({
      // Root node_modules. `root/node_modules`.
      modulesDir: path.resolve(cwd, '../../node_modules'),
      allowlist: [/@workspace/], // An array for the externals to allow, so they will be included in the bundle.
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'], // Configure which extensions should be resolved.
  },
  module: {
    rules: [
      // ECMAScript Modules: Transpile and load using javascript. It's only used on node_modules dependencies.
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },

      // Typescript and Javascript: Transpile and load using esbuild-loader.
      {
        test: /\.([jt]sx?)$/,
        loader: 'esbuild-loader',
        exclude: [/node_modules/],
        include: [src, ...workspaces],
        options: {
          loader: 'ts',
          target: 'es2015',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // Remove all files inside the output folder before build.
    new WebpackBar(), // ProgressBar and Profiler for Webpack.
  ],
};
