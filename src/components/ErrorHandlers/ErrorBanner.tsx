import React from 'react';
import {Linking, StyleSheet} from 'react-native';
import {Banner, Text} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useAppTheme} from '../../styles/Theme';

export const ErrorBanner = () => {
  const {errorBanner, setErrorBanner} = useErrorHandler();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    banner: {
      backgroundColor: theme.colors.error,
    },
    innerText: {
      color: theme.colors.onError,
    },
    button: {
      color: theme.colors.onPrimary,
    },
  });

  return (
    <Banner
      style={styles.banner}
      visible={!!errorBanner}
      actions={[
        {
          label: 'Settings',
          onPress: () => Linking.openURL('tricordarr://settingstab'),
          labelStyle: styles.button,
        },
        {
          label: 'Dismiss',
          onPress: () => setErrorBanner(undefined),
          labelStyle: styles.button,
        },
      ]}>
      <Text style={styles.innerText}>{errorBanner}</Text>
    </Banner>
  );
};
