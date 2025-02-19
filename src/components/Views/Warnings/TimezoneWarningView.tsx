import {Text} from 'react-native-paper';
import React from 'react';
import {Linking, StyleSheet, TouchableOpacity} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const TimezoneWarningView = () => {
  const {commonStyles} = useStyles();
  const {showTimeZoneWarning} = useCruise();
  const {serverUrl} = useSwiftarrQueryClient();
  const commonStack = useCommonStack();
  const onPress = () => {
    commonStack.push(CommonStackComponents.siteUIScreen, {
      resource: 'time',
      timestamp: new Date().toISOString(),
    });
  };
  // The WebView seems to be reporting the wrong time. It sticks with a device default
  // and not what its currently set to.
  // This here for debugging.
  const onLongPress = () => Linking.openURL(`${serverUrl}/time`);

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.twitarrNegative,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    headerText: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
    subText: {
      ...commonStyles.onTwitarrButton,
    },
  });

  if (!showTimeZoneWarning) {
    return <></>;
  }

  return (
    <TouchableOpacity style={styles.headerView} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.headerText}>Time Zone Warning!</Text>
      <Text variant={'bodyMedium'} style={styles.subText}>
        Your device is in a different time zone than the server.
      </Text>
    </TouchableOpacity>
  );
};
