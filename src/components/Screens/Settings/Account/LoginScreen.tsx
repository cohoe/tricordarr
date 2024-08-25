import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';
import {LoginForm} from '../../../Forms/User/LoginForm.tsx';
import {useNavigation} from '@react-navigation/native';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {LoginFormValues} from '../../../../libraries/Types/FormValues';
import {commonStyles} from '../../../../styles';
import {useLoginQuery} from '../../../Queries/Auth/LoginQueries';
import {FormikHelpers} from 'formik';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {startForegroundServiceWorker} from '../../../../libraries/Service';
import {useClientConfigQuery} from '../../../Queries/Client/ClientQueries.tsx';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const loginMutation = useLoginQuery();
  const {signIn} = useAuth();
  const {appConfig, updateAppConfig} = useConfig();
  const {refetch: refetchClientConfig, data: clientConfigData} = useClientConfigQuery();

  const updateClientConfig = useCallback(async () => {
    await refetchClientConfig();
    if (clientConfigData) {
      const [year, month, day] = clientConfigData.spec.cruiseStartDate.split('-').map(Number);
      updateAppConfig({
        ...appConfig,
        cruiseLength: clientConfigData.spec.cruiseLength,
        cruiseStartDate: new Date(year, month - 1, day),
        oobeExpectedVersion: clientConfigData.spec.oobeVersion,
        portTimeZoneID: clientConfigData.spec.portTimeZoneID,
        schedBaseUrl: clientConfigData.spec.schedBaseUrl,
      });
    }
  }, [appConfig, clientConfigData, refetchClientConfig, updateAppConfig]);

  const onSubmit = useCallback(
    (formValues: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
      loginMutation.mutate(formValues, {
        onSuccess: async response => {
          await signIn(response.data);
          await Promise.all([startForegroundServiceWorker(), updateClientConfig()]);
          navigation.goBack();
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      });
    },
    [loginMutation, navigation, signIn, updateClientConfig],
  );

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottom}>Logging in to {appConfig.serverUrl}.</Text>
          <Text style={commonStyles.marginBottom}>Usernames are case-insensitive.</Text>
          <LoginForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
