const path = require('path');

let workspaces = ['relay', 'ui']; // Workspaces that should be bundled/watched by webpack.
workspaces = workspaces.map((ws) => path.resolve(__dirname, '..', ws)); // Transform workspace name into absolute path.

let node_modules = path.resolve(__dirname, '../../node_modules'); // Root node_modules. `relay-books-app/node_modules`.

module.exports = {
  projectRoot: path.resolve(__dirname, '.'), // The root folder of your project.
  watchFolders: [node_modules, ...workspaces], // Specify any additional (to projectRoot) watch folders, this is used to know which files to watch.
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
