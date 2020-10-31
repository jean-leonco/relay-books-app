const path = require('path');

const packages = ['relay', 'ui', 'hooks'];

module.exports = {
  projectRoot: path.resolve(__dirname, '.'),
  watchFolders: [
    path.resolve(__dirname, '../../node_modules'),
    ...packages.map((pkg) => path.resolve(__dirname, `../${pkg}`)),
  ],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
