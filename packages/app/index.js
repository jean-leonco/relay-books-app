import { AppRegistry, LogBox } from 'react-native';

import { name as appName } from './app.json';
import App from './src/App';

// @TODO - find lib generating this
LogBox.ignoreLogs(['Setting a timer for a long']);

AppRegistry.registerComponent(appName, () => App);
