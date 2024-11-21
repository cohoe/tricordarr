import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {BooleanField} from '../../Forms/Fields/BooleanField';
import {HelperText, SegmentedButtons, Text} from 'react-native-paper';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {SegmentedButtonType} from '../../../libraries/Types';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import {ListSection} from '../../Lists/ListSection.tsx';

export const LfgSettingsScreen = () => {
  const {appConfig, updateAppConfig, hasNotificationPermission} = useConfig();
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.schedule.hidePastLfgs);
  const {setLfgHidePastFilter} = useFilter();
  const {commonStyles} = useStyles();
  const [defaultScreen, setDefaultScreen] = useState(appConfig.schedule.defaultLfgScreen);

  const handleHidePastLfgs = () => {
    const newValue = !appConfig.schedule.hidePastLfgs;
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        hidePastLfgs: newValue,
      },
    });
    setHidePastLfgs(newValue);
    setLfgHidePastFilter(newValue);
  };

  const lfgDefaultButtons: SegmentedButtonType[] = [
    {
      value: LfgStackComponents.lfgFindScreen,
      label: 'Find',
      icon: AppIcons.lfgFind,
    },
    {
      value: LfgStackComponents.lfgJoinedScreen,
      label: 'Joined',
      icon: AppIcons.lfgJoined,
    },
    {
      value: LfgStackComponents.lfgOwnedScreen,
      label: 'Owned',
      icon: AppIcons.lfgOwned,
    },
  ];

  const handleLfgDefaultScreen = (value: string) => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        defaultLfgScreen: value as LfgStackComponents,
      },
    });
    setDefaultScreen(value as LfgStackComponents);
  };

  const toggleLFGUnreadNotifications = () => {
    updateAppConfig({
      ...appConfig,
      pushNotifications: {
        ...appConfig.pushNotifications,
        fezUnreadMsg: !appConfig.pushNotifications.fezUnreadMsg,
      },
    });
  };

  const toggleLfgJoinedNotifications = () => {
    updateAppConfig({
      ...appConfig,
      pushNotifications: {
        ...appConfig.pushNotifications,
        joinedLFGStarting: !appConfig.pushNotifications.joinedLFGStarting,
      },
    });
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>General</ListSubheader>
                <BooleanField
                  name={'hidePastLfgs'}
                  label={'Hide Past LFGs by Default'}
                  onPress={handleHidePastLfgs}
                  style={commonStyles.paddingHorizontal}
                  helperText={
                    'Default to not showing LFGs that have already happened. You can still use the filters to view them.'
                  }
                  value={hidePastLfgs}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={commonStyles.marginBottomSmall}>Default LFG Screen</Text>
          <SegmentedButtons buttons={lfgDefaultButtons} value={defaultScreen} onValueChange={handleLfgDefaultScreen} />
          <HelperText style={commonStyles.onBackground} type={'info'}>
            Changing this setting requires an app restart.
          </HelperText>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                <BooleanField
                  key={'fezUnreadMsg'}
                  name={'fezUnreadMsg'}
                  label={'LFG Posts'}
                  value={appConfig.pushNotifications.fezUnreadMsg}
                  onPress={toggleLFGUnreadNotifications}
                  disabled={!hasNotificationPermission}
                  helperText={"New unread chat public messages posted in an LFG you've joined or that you own."}
                  style={commonStyles.paddingHorizontal}
                />
                <BooleanField
                  key={'joinedLFGStarting'}
                  name={'joinedLFGStarting'}
                  label={'Joined LFG Reminders'}
                  value={appConfig.pushNotifications.joinedLFGStarting}
                  onPress={toggleLfgJoinedNotifications}
                  disabled={!hasNotificationPermission}
                  helperText={'Reminder that a joined LFG is starting Soon™.'}
                  style={commonStyles.paddingHorizontal}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
