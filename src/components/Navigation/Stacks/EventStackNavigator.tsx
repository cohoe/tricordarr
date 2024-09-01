import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {EventSearchScreen} from '../../Screens/Event/EventSearchScreen';
import {EventSettingsScreen} from '../../Screens/Event/EventSettingsScreen';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {DisabledView} from '../../Views/Static/DisabledView';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';
import {MainStack} from './MainStackNavigator';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen.tsx';
import {ScheduleImportScreen} from '../../Screens/Schedule/ScheduleImportScreen.tsx';

export type EventStackParamList = CommonStackParamList & {
  EventSearchScreen: undefined;
  EventSettingsScreen: undefined;
  ScheduleDayScreen: undefined;
  ScheduleImportScreen: undefined;
};

export const EventStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<EventStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.schedule);

  return (
    <Stack.Navigator
      initialRouteName={EventStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={EventStackComponents.eventSearchScreen}
        component={EventSearchScreen}
        options={{title: 'Search Events'}}
      />
      <Stack.Screen
        name={EventStackComponents.eventSettingsScreen}
        component={EventSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen
        name={EventStackComponents.scheduleDayScreen}
        component={isDisabled ? DisabledView : ScheduleDayScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Schedule',
        }}
      />
      <Stack.Screen
        name={EventStackComponents.scheduleImportScreen}
        component={ScheduleImportScreen}
        options={{title: 'Schedule Import'}}
      />
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useEventStackNavigation = () => useNavigation<NativeStackNavigationProp<EventStackParamList>>();

export const useEventStackRoute = () => useRoute<RouteProp<EventStackParamList>>();
