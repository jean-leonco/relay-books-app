import { AppRegistry, LogBox } from 'react-native';

import App from './src/App';
import { name as appName } from './app.json';

// @TODO - find lib generating this
LogBox.ignoreLogs(['Setting a timer for a long']);

AppRegistry.registerComponent(appName, () => App);
