import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {useForumThreadQuery} from '../../../Queries/Forum/ForumCategoryQueries';
import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {
  BottomTabComponents,
  EventStackComponents,
  ForumStackComponents,
  NavigatorIDs,
  RootStackComponents,
} from '../../../../libraries/Enums/Navigation';
import {ForumListData, PostContentData, PostData} from '../../../../libraries/Structs/ControllerStructs';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import {ForumLockedView} from '../../../Views/Static/ForumLockedView';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {useRootStack} from '../../../Navigation/Stacks/RootStackNavigator';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {ForumThreadScreenActionsMenu} from '../../../Menus/Forum/ForumThreadScreenActionsMenu';
import {useForumRelationMutation} from '../../../Queries/Forum/ForumRelationQueries';
import {useAppTheme} from '../../../../styles/Theme';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {ListTitleView} from '../../../Views/ListTitleView';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';
import {ContentPostForm} from '../../../Forms/ContentPostForm';
import {FormikHelpers, FormikProps} from 'formik';
import {useForumPostCreateMutation} from '../../../Queries/Forum/ForumPostQueries';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {PostAsUserBanner} from '../../../Banners/PostAsUserBanner';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useIsFocused} from '@react-navigation/native';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';
import {replaceMentionValues} from 'react-native-controlled-mentions';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadScreen = ({route, navigation}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useForumThreadQuery(route.params.forumID);
  const [refreshing, setRefreshing] = useState(false);
  const {forumData, setForumData, forumPosts, dispatchForumPosts, forumListData, dispatchForumListData} = useTwitarr();
  const rootNavigation = useRootStack();
  const {profilePublicData} = useUserData();
  const relationMutation = useForumRelationMutation();
  const theme = useAppTheme();
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const postCreateMutation = useForumPostCreateMutation();
  const {setErrorMessage} = useErrorHandler();
  const flatListRef = useRef<FlatList<PostData>>(null);
  const {hasModerator} = usePrivilege();
  const isFocused = useIsFocused();
  const [forumListItem, setForumListItem] = useState<ForumListData>();
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => {
      if (forumListItem) {
        console.log('[ForumThreadScreen.tsx] Marking local ForumListItem as read.');
        setForumListItem({
          ...forumListItem,
          readCount: forumListItem.postCount,
        });
      }
      setRefreshing(false);
    });
  }, [forumListItem, refetch]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };
  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
    }
  };

  const handleFavorite = useCallback(() => {
    if (forumData) {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: forumData.forumID,
          relationType: 'favorite',
          action: forumData.isFavorite ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            setForumData({
              ...forumData,
              isFavorite: !forumData.isFavorite,
            });
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: forumData.isMuted,
              isFavorite: !forumData.isFavorite,
            });
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [dispatchForumListData, forumData, relationMutation, setForumData]);

  const handleMute = useCallback(() => {
    if (forumData) {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: forumData.forumID,
          relationType: 'mute',
          action: forumData.isMuted ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            setForumData({
              ...forumData,
              isMuted: !forumData.isMuted,
            });
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: !forumData.isMuted,
              isFavorite: forumData.isFavorite,
            });
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [dispatchForumListData, forumData, relationMutation, setForumData]);

  const getNavButtons = useCallback(() => {
    // Typescript struggles
    if (!forumData) {
      return <></>;
    }
    const eventID = forumData?.eventID;

    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={onRefresh} />
          {eventID && (
            <Item
              title={'Event'}
              iconName={AppIcons.events}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.scheduleTab,
                  params: {
                    screen: EventStackComponents.eventScreen,
                    initial: false,
                    params: {
                      eventID: eventID,
                    },
                  },
                })
              }
            />
          )}
          <Item
            title={'Favorite'}
            color={
              forumData.isFavorite
                ? theme.colors.twitarrYellow
                : forumData.isMuted
                ? theme.colors.onSurfaceDisabled
                : undefined
            }
            iconName={AppIcons.favorite}
            onPress={handleFavorite}
            disabled={forumData.isMuted}
          />
          {forumData.creator.userID !== profilePublicData?.header.userID && (
            <Item
              title={'Mute'}
              color={
                forumData.isMuted
                  ? theme.colors.twitarrNegativeButton
                  : forumData.isFavorite
                  ? theme.colors.onSurfaceDisabled
                  : undefined
              }
              iconName={AppIcons.mute}
              onPress={handleMute}
              disabled={forumData.isFavorite}
            />
          )}
          <ForumThreadScreenActionsMenu forumData={forumData} />
        </HeaderButtons>
      </View>
    );
  }, [
    forumData,
    handleFavorite,
    handleMute,
    onRefresh,
    profilePublicData?.header.userID,
    rootNavigation,
    theme.colors.onSurfaceDisabled,
    theme.colors.twitarrNegativeButton,
    theme.colors.twitarrYellow,
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages && isFocused) {
      const postListData = data.pages.flatMap(fd => fd.posts);
      console.log('[ForumThreadScreen.tsx] Setting ForumThreadPosts and ForumData.');
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: postListData.reverse(),
      });
      setForumData(data.pages[0]);
      // This is a hack to get around unread counts on first load.
      // The spread operator is to ensure a copy of the object that doesn't update with the list
      // when the mark-as-read action occurs.
      // Only works if you came from ForumCategoriesScreen.
      if (!forumListItem) {
        let item = forumListData.find(fdl => fdl.forumID === data.pages[0].forumID);
        setForumListItem(item ? {...item} : undefined);
      }
    }
  }, [
    data,
    dispatchForumPosts,
    setForumData,
    isFocused,
    setForumListItem,
    forumListData,
    forumListItem,
    // forumListDataUser,
  ]);

  useEffect(() => {
    if (forumListItem) {
      console.log(`[ForumThreadScreen.tsx] Marking forum ${forumListItem.forumID} as read.`);
      dispatchForumListData({
        type: ForumListDataActions.markAsRead,
        forumID: forumListItem.forumID,
      });
    }
  }, [dispatchForumListData, forumListItem]);

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    formikHelpers.setSubmitting(true);
    if (!forumData) {
      setErrorMessage('Forum Data missing? This is definitely a bug.');
      formikHelpers.setSubmitting(false);
      return;
    }
    values.text = replaceMentionValues(values.text, ({name}) => `@${name}`);
    // Mark as read if applicable.
    if (forumListItem) {
      setForumListItem({
        ...forumListItem,
        readCount: forumListItem.postCount,
      });
    }
    postCreateMutation.mutate(
      {
        forumID: forumData.forumID,
        postData: values,
      },
      {
        onSuccess: response => {
          dispatchForumPosts({
            type: ForumPostListActions.prependPost,
            newPost: response.data,
          });
          if (forumListItem) {
            dispatchForumListData({
              type: ForumListDataActions.touch,
              thread: {
                ...forumListItem,
                postCount: forumListItem.postCount + 1,
                readCount: forumListItem.readCount + 1,
                lastPostAt: new Date().toISOString(),
                lastPoster: profilePublicData?.header,
              },
            });
          }
          formikHelpers.resetForm();
          // https://github.com/jocosocial/swiftarr/issues/237
          // Refetch needed to "mark" the forum as read.
          refetch().then(() => {
            flatListRef.current?.scrollToOffset({offset: 0, animated: false});
          });
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
        },
      },
    );
  };

  if (!data || isLoading || isLoadingFavorites) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <PostAsUserBanner />
      <ListTitleView title={forumData?.title} />
      {forumData?.isLocked && <ForumLockedView />}
      <ForumPostFlatList
        postList={forumPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        invertList={true}
        forumData={forumData}
        hasPreviousPage={hasPreviousPage}
        maintainViewPosition={true}
        getListHeader={undefined}
        flatListRef={flatListRef}
        forumListData={forumListItem}
        hasNextPage={hasNextPage}
      />
      {(!forumData?.isLocked || hasModerator) && (
        <ContentPostForm
          onSubmit={onPostSubmit}
          formRef={postFormRef}
          enablePhotos={true}
          maxLength={2000}
          maxPhotos={4}
        />
      )}
    </AppView>
  );
};
