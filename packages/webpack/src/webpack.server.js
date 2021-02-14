const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const cwd = process.cwd();

const src = path.resolve(cwd, 'src');

let workspaces = []; // Workspaces that should be bundled/watched by webpack.
workspaces = workspaces.map((ws) => path.resolve(cwd, '..', ws)); // Transform workspace name into absolute path.

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
    // Prevent bundling node_modules and instead retrieve these external dependencies at runtime. This improves build time and bundle size.
    nodeExternals(), // Workspace node_modules. `relay-books-app/packages/server/node_modules`.
    nodeExternals({
      modulesDir: path.resolve(cwd, '../../node_modules'), // Root node_modules. `relay-books-app/node_modules`.
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

      // Typescript and Javascript: Transpile and load using swc-loader.
      {
        test: /\.(js|ts|tsx)?$/,
        use: 'swc-loader',
        exclude: [/node_modules/, /__tests__/, /@types/, /test/, '/scripts/'],
        include: [src, ...workspaces],
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
};
