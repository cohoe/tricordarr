import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackComponents} from '../../../libraries/Enums/Navigation';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {MainView} from '../../Views/Static/MainView';
import {TwitarrView} from '../../Views/TwitarrView';
import {SettingsStack, SettingsStackParamList} from './SettingsStack';
import {AboutScreen} from '../../Screens/Main/AboutScreen';
import {UserProfileScreen} from '../../Screens/User/UserProfileScreen';
import {UserDirectoryScreen} from '../../Screens/User/UserDirectoryScreen';

export type MainStackParamList = {
  MainScreen: undefined;
  SiteUIScreen: undefined;
  MainSettingsScreen: NavigatorScreenParams<SettingsStackParamList>;
  AboutScreen: undefined;
  UserProfileScreen: {
    userID: string;
  };
  UserDirectoryScreen: undefined;
};

export const MainStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<MainStackParamList>();

  return (
    <Stack.Navigator initialRouteName={MainStackComponents.mainScreen} screenOptions={screenOptions}>
      <Stack.Screen name={MainStackComponents.mainScreen} component={MainView} options={{title: 'Twitarr Home'}} />
      <Stack.Screen
        name={MainStackComponents.siteUIScreen}
        component={TwitarrView}
        options={{title: 'Twitarr Web UI'}}
      />
      <Stack.Screen
        name={MainStackComponents.mainSettingsScreen}
        component={SettingsStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={MainStackComponents.aboutScreen}
        component={AboutScreen}
        options={{title: 'About Tricordarr'}}
      />
      <Stack.Screen
        name={MainStackComponents.userProfileScreen}
        component={UserProfileScreen}
        options={{title: 'User Profile'}}
      />
      <Stack.Screen
        name={MainStackComponents.userDirectoryScreen}
        component={UserDirectoryScreen}
        options={{title: 'Directory'}}
      />
    </Stack.Navigator>
  );
};

export const useMainStack = () => useNavigation<NativeStackNavigationProp<MainStackParamList>>();
