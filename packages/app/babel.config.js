module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'relay',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: true,
      },
    ],
  ],
  sourceMaps: true,
};
