import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import * as Yup from 'yup';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingForm} from '../../Forms/SettingForm';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SettingFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useHealthQuery} from '../../Queries/Client/ClientQueries';
import {HttpStatusCode} from 'axios';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {OobeServerHeaderTitle} from '../../Navigation/Components/OobeServerHeaderTitle';
import {ServerURLValidation} from '../../../libraries/ValidationSchema';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {ServerHealthcheckResultView} from '../../Views/Settings/ServerHealthcheckResultView.tsx';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen, NavigatorIDs.oobeStack>;

const validationSchema = Yup.object().shape({
  settingValue: ServerURLValidation,
});

export const OobeServerScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const getHeaderTitle = useCallback(() => <OobeServerHeaderTitle />, []);
  const theme = useAppTheme();

  const onSave = (values: SettingFormValues, formikHelpers: FormikHelpers<SettingFormValues>) => {
    updateAppConfig({
      ...appConfig,
      serverUrl: values.settingValue,
    });
    refetch().then(() => formikHelpers.resetForm());
  };

  useEffect(() => {
    if (serverHealthData && serverHealthData.status === HttpStatusCode.Ok) {
      setServerHealthPassed(true);
    } else {
      setServerHealthPassed(false);
    }
  }, [serverHealthData]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: getHeaderTitle,
    });
  }, [getHeaderTitle, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Do not change this unless instructed to do so by the Twitarr Dev Team or THO.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <SettingForm
            value={appConfig.serverUrl}
            onSave={onSave}
            validationSchema={validationSchema}
            inputMode={'url'}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ServerHealthcheckResultView serverHealthData={serverHealthData} serverHealthPassed={serverHealthPassed} />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Re-check server'}
            onPress={refetch}
            buttonColor={theme.colors.twitarrNeutralButton}
            isLoading={isFetching}
            disabled={isFetching}
          />
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeConductScreen)}
        rightDisabled={!serverHealthPassed}
      />
    </AppView>
  );
};
