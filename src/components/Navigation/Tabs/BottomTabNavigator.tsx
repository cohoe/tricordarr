import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {AppIcon} from '../../Images/AppIcon';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {SeamailStack, SeamailStackParamList} from '../Stacks/SeamailStack';
import {BottomTabComponents} from '../../../libraries/Enums/Navigation';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {MainStack, MainStackParamList} from '../Stacks/MainStack';
import {NotImplementedView} from '../../Views/Static/NotImplementedView';

function getBadgeDisplayValue(input: number | undefined) {
  if (input === 0) {
    return undefined;
  }
  return input;
}

/**
 * This is where we define the root tabs and associate each one with its relevant
 * navigation param list.
 */
export type BottomTabParamList = {
  HomeTab: NavigatorScreenParams<MainStackParamList>;
  SeamailTab: NavigatorScreenParams<SeamailStackParamList>;
  ScheduleTab: undefined;
  ForumsTab: undefined;
};

export const BottomTabNavigator = () => {
  const {userNotificationData} = useUserNotificationData();
  const Tab = createMaterialBottomTabNavigator<BottomTabParamList>();

  function getIcon(icon: string) {
    return <AppIcon icon={icon} />;
  }

  return (
    <Tab.Navigator initialRouteName={BottomTabComponents.homeTab}>
      <Tab.Screen
        name={BottomTabComponents.homeTab}
        component={MainStack}
        options={{
          title: 'Home',
          tabBarIcon: () => getIcon('home-account'),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newAnnouncementCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.seamailTab}
        component={SeamailStack}
        options={{
          title: 'Chat',
          tabBarIcon: () => getIcon('email'),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newSeamailMessageCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.forumsTab}
        component={NotImplementedView}
        options={{
          title: 'Forums',
          tabBarIcon: () => getIcon(AppIcons.forum),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.scheduleTab}
        component={NotImplementedView}
        options={{
          title: 'Schedule',
          tabBarIcon: () => getIcon(AppIcons.events),
        }}
      />
    </Tab.Navigator>
  );
};

export const useBottomTabNavigator = () => useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
