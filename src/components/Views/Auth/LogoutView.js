import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import axios from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {SaveButton} from '../../Buttons/SaveButton';
import {AppSettings} from '../../../libraries/AppSettings';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../Context/Contexts/UserDataContext';

export const TempUserProfile = () => {
  const [token, setToken] = useState('unknown');
  const {isLoading, error, data} = useQuery({
    queryKey: ['/user/profile'],
  });

  useEffect(() => {
    async function getToken() {
      setToken(await AppSettings.AUTH_TOKEN.getValue());
    }
    getToken();
  }, []);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    return <Text>{error.message}</Text>;
  }
  return (
    <>
      <Text>{JSON.stringify(data)}</Text>
      <Text>Auth Token: {token}</Text>
    </>
  );
};

export const LogoutView = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {setTokenStringData, setProfilePublicData} = useUserData();

  const logoutMutation = useMutation(
    async () => {
      // Gotta do the call before clearing our local state.
      let response = await axios.post('/auth/logout');
      await clearAuthData();
      return response;
    },
    {retry: 0},
  );

  function onPress() {
    logoutMutation.mutate(null, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  }

  async function clearAuthData() {
    console.log('Clearing auth data.');
    console.log('Old username was:', await AppSettings.USERNAME.getValue());
    console.log('Old token was:', await AppSettings.AUTH_TOKEN.getValue());
    await AppSettings.AUTH_TOKEN.remove();
    await AppSettings.USERNAME.remove();
    await AppSettings.USER_ID.remove();
    // I don't know why await is needed here.
    await setTokenStringData({});
    await setProfilePublicData({});
    navigation.goBack();
  }

  return (
    <View style={{backgroundColor: theme.colors.background}}>
      <TempUserProfile />
      <SaveButton buttonColor={theme.colors.twitarrNegativeButton} buttonText={'Logout'} onPress={onPress} />
      <SaveButton
        buttonColor={theme.colors.twitarrNeutralButton}
        buttonText={'Clear Auth Data'}
        onPress={clearAuthData}
      />
      {logoutMutation.isError ? <Text>An error occurred: {logoutMutation.error.message}</Text> : null}
      {logoutMutation.isSuccess ? <Text>Logged out!</Text> : null}
    </View>
  );
};
