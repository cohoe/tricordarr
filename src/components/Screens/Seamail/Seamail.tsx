import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {FezPostListItem} from '../../Lists/Items/FezPostListItem';
import {ListSeparator} from '../../Lists/ListSeparator';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {SeamailActionsMenu} from '../../Menus/SeamailActionsMenu';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {FezPostForm} from '../../Forms/FezPostForm';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading} = useUserData();
  const {commonStyles} = useStyles();

  const {data, refetch} = useQuery<FezData>({
    queryKey: [`/fez/${route.params.fezID}`],
    enabled: isLoggedIn && !isLoading && !!route.params.fezID,
  });

  const showPostAuthor = !!(data && data.participantCount > 2);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View style={[commonStyles.flexRow]}>
        <NavBarIconButton icon={'reload'} onPress={onRefresh} />
        {data && <SeamailActionsMenu fez={data} />}
      </View>
    );
  }, [commonStyles.flexRow, data, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const onSubmit = (values: object) => console.log(values);

  if (!data) {
    return <LoadingView />;
  }
  // This is a big sketch.
  // https://www.reddit.com/r/reactjs/comments/rgyy68/can_somebody_help_me_understand_why_does_reverse/?rdt=33460
  // The inverted=true + data.reverse() bits could get interesting with
  // dynamically adding more messages to the array.
  const fezPostData = [...(data?.members?.posts || [])].reverse();
  return (
    <AppView>
      <FlatList
        // This is dumb.
        // https://github.com/facebook/react-native/issues/26264
        removeClippedSubviews={false}
        ItemSeparatorComponent={ListSeparator}
        data={fezPostData}
        inverted={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
        renderItem={({item, index, separators}) => (
          <PaddedContentView padBottom={false}>
            <FezPostListItem item={item} index={index} separators={separators} showAuthor={showPostAuthor} />
          </PaddedContentView>
        )}
      />
      <FezPostForm onSubmit={onSubmit} />
    </AppView>
  );
};
