import React, {useState} from 'react';
import {RefreshControl} from 'react-native';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {CruiseSettingsForm} from '../../../Forms/Settings/CruiseSettingsForm.tsx';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {CruiseSettingsFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '../../../../styles/Theme.ts';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {useClientConfigQuery} from '../../../Queries/Client/ClientQueries.tsx';

export const CruiseSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {data, refetch} = useClientConfigQuery({enabled: false});
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const initialValues: CruiseSettingsFormValues = {
    portTimeZoneID: appConfig.portTimeZoneID,
    cruiseLength: appConfig.cruiseLength.toString(),
    startDate: appConfig.cruiseStartDate,
    schedBaseUrl: appConfig.schedBaseUrl,
  };

  const onSubmit = (values: CruiseSettingsFormValues, helpers: FormikHelpers<CruiseSettingsFormValues>) => {
    let startDate = values.startDate;
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    updateAppConfig({
      ...appConfig,
      portTimeZoneID: values.portTimeZoneID,
      cruiseLength: Number(values.cruiseLength),
      cruiseStartDate: startDate,
      schedBaseUrl: values.schedBaseUrl,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        portTimeZoneID: values.portTimeZoneID,
        cruiseLength: values.cruiseLength,
        startDate: values.startDate,
        schedBaseUrl: values.schedBaseUrl,
      },
    });
  };

  const reloadClientConfig = async () => {
    setRefreshing(true);
    await refetch();
    if (data) {
      const [year, month, day] = data.spec.cruiseStartDate.split('-').map(Number);
      updateAppConfig({
        ...appConfig,
        cruiseLength: data.spec.cruiseLength,
        cruiseStartDate: new Date(year, month - 1, day),
        oobeExpectedVersion: data.spec.oobeVersion,
        portTimeZoneID: data.spec.portTimeZoneID,
        schedBaseUrl: data.spec.schedBaseUrl,
      });
    }
    setRefreshing(false);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true} refreshControl={<RefreshControl refreshing={refreshing} enabled={false} />}>
        <PaddedContentView>
          <CruiseSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Reload From Server'}
            onPress={reloadClientConfig}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
