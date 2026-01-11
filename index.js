import { AppRegistry } from 'react-native';
import App from './App';   // 👈 MUST point to App.tsx
import { name as appName } from './app.json';

import { enableScreens } from 'react-native-screens';
enableScreens();

AppRegistry.registerComponent(appName, () => App);
