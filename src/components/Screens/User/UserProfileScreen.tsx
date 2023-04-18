import React, {useCallback, useEffect, useState} from 'react';
import {Button, Card, Divider, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {ProfilePublicData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {AppImage} from '../../Images/AppImage';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.userProfileScreen,
  NavigatorIDs.userStack
>;

export const UserProfileScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useUserData();
  const {commonStyles} = useStyles();

  const {data, refetch} = useQuery<ProfilePublicData>({
    queryKey: [`/users/${route.params.userID}/profile`],
    enabled: isLoggedIn,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View style={[commonStyles.flexRow]}>
        <NavBarIconButton icon={'star'} onPress={() => console.log('favorite')} />
        <NavBarIconButton icon={'email-plus'} onPress={() => console.log('seamail')} />
        <NavBarIconButton icon={'phone-outgoing'} onPress={() => console.log('krakentalk')} />
      </View>
    );
  }, [commonStyles.flexRow]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!data) {
    return <LoadingView />;
  }
  console.log(data);

  const styles = {
    image: [commonStyles.roundedBorder, commonStyles.headerImage],
    listContentCenter: [commonStyles.flexRow, commonStyles.justifyCenter],
    button: [commonStyles.marginHorizontalSmall],
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {data.message && (
          <PaddedContentView padBottom={false} style={[styles.listContentCenter]}>
            <Text selectable={true}>{data.message}</Text>
          </PaddedContentView>
        )}
        <PaddedContentView padTop={true} style={[styles.listContentCenter]}>
          <AppImage style={styles.image} path={`/image/user/thumb/${route.params.userID}`} />
        </PaddedContentView>
        <PaddedContentView style={[styles.listContentCenter]}>
          <Text selectable={true} variant={'headlineMedium'}>
            {UserHeader.getByline(data.header)}
          </Text>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true} style={[styles.listContentCenter]}>
          <Button style={styles.button} icon={'cancel'} mode={'contained-tonal'} onPress={() => console.log('block')}>
            Block
          </Button>
          <Button
            style={styles.button}
            icon={'volume-off'}
            mode={'contained-tonal'}
            onPress={() => console.log('mute')}>
            Mute
          </Button>
          <Button
            style={styles.button}
            icon={'alert-octagon'}
            mode={'contained-tonal'}
            onPress={() => console.log('report')}>
            Report
          </Button>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Card>
            <Card.Title title="User Profile" />
            <Card.Content>
              <ListSection>
                {data.header.username && <DataFieldListItem title={'Username'} description={data.header.username} />}
                {data.header.displayName && (
                  <DataFieldListItem title={'Display Name'} description={data.header.displayName} />
                )}
                {data.realName && <DataFieldListItem title={'Real Name'} description={data.realName} />}
                {data.preferredPronoun && <DataFieldListItem title={'Pronouns'} description={data.preferredPronoun} />}
                {data.email && <DataFieldListItem title={'Email'} description={data.email} />}
                {data.homeLocation && <DataFieldListItem title={'Home Location'} description={data.homeLocation} />}
                {data.roomNumber && <DataFieldListItem title={'Room Number'} description={data.roomNumber} />}
              </ListSection>
            </Card.Content>
          </Card>
        </PaddedContentView>
        {data.about && (
          <PaddedContentView>
            <Card>
              <Card.Title title="About" />
              <Card.Content>
                <Text selectable={true}>{data.about}</Text>
              </Card.Content>
            </Card>
          </PaddedContentView>
        )}
        <PaddedContentView>
          <Card>
            <Card.Title title="Private Note" />
            <Card.Content>
              <Text selectable={true}>{data.note}</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode={'contained-tonal'}>Edit</Button>
            </Card.Actions>
          </Card>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
