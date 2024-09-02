import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {ForumData, ForumListData, PostContentData, PostData} from '../../../../libraries/Structs/ControllerStructs';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import {ForumLockedView} from '../../../Views/Static/ForumLockedView';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {ForumThreadScreenActionsMenu} from '../../../Menus/Forum/ForumThreadScreenActionsMenu';
import {ListTitleView} from '../../../Views/ListTitleView';
import {ContentPostForm} from '../../../Forms/ContentPostForm';
import {FormikHelpers, FormikProps} from 'formik';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {PostAsUserBanner} from '../../../Banners/PostAsUserBanner';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {CommonStackComponents, useCommonStack} from '../../../Navigation/CommonScreens';
import {InfiniteData, QueryObserverResult, useQueryClient} from '@tanstack/react-query';
import {useForumPostCreateMutation} from '../../../Queries/Forum/ForumPostMutations';
import {ForumThreadPinnedPostsItem} from '../../../Menus/Forum/Items/ForumThreadPinnedPostsItem';

interface ForumThreadScreenBaseProps {
  data?: InfiniteData<ForumData>;
  refetch: () => Promise<QueryObserverResult>;
  isLoading: boolean;
  fetchNextPage: () => Promise<QueryObserverResult>;
  fetchPreviousPage: () => Promise<QueryObserverResult>;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  getListHeader?: () => ReactNode;
  invertList?: boolean;
  forumListData?: ForumListData;
}
export const ForumThreadScreenBase = ({
  data,
  refetch,
  isLoading,
  fetchNextPage,
  fetchPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  hasNextPage,
  hasPreviousPage,
  getListHeader,
  invertList,
  forumListData,
}: ForumThreadScreenBaseProps) => {
  const navigation = useCommonStack();
  const [refreshing, setRefreshing] = useState(false);
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const postCreateMutation = useForumPostCreateMutation();
  const {setErrorMessage} = useErrorHandler();
  const flatListRef = useRef<FlatList<PostData>>(null);
  const {hasModerator} = usePrivilege();
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();
  const queryClient = useQueryClient();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  // Needed for useEffect checking.
  const forumData = data?.pages[0];
  const [maintainViewPosition, setMaintainViewPosition] = useState(true);
  const invalidationQueryKeys = ForumListData.getForumCacheKeys(data?.pages[0].categoryID, data?.pages[0].forumID)

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  const getNavButtons = useCallback(() => {
    // Typescript struggles
    if (!data?.pages[0]) {
      return <></>;
    }
    const eventID = data.pages[0].eventID;

    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {eventID && (
            <Item
              title={'Event'}
              iconName={AppIcons.events}
              onPress={() => navigation.push(CommonStackComponents.eventScreen, {eventID: eventID})}
            />
          )}
          <ForumThreadPinnedPostsItem forumID={data.pages[0].forumID} navigation={navigation} />
          <ForumThreadScreenActionsMenu
            forumData={data.pages[0]}
            invalidationQueryKeys={invalidationQueryKeys}
            onRefresh={onRefresh}
          />
        </HeaderButtons>
      </View>
    );
  }, [data?.pages, navigation, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages) {
      const postListData = data.pages.flatMap(fd => fd.posts);
      setForumPosts(invertList ? postListData.reverse() : postListData);
    }
  }, [data, setForumPosts, invertList]);

  useEffect(() => {
    if (forumData) {
      if (forumListData && forumListData.readCount === forumListData.postCount) {
        console.log(`[ForumThreadScreenBase.tsx] Forum ${forumData.forumID} has already been read.`);
        return;
      }
      console.log(`[ForumThreadScreenBase.tsx] Marking forum ${forumData.forumID} as read.`);
      invalidationQueryKeys.map(key => {
        queryClient.invalidateQueries(key);
      });
    }
  }, [forumData, queryClient, forumListData]);

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    formikHelpers.setSubmitting(true);
    if (!data?.pages[0]) {
      setErrorMessage('Forum Data missing? This is definitely a bug.');
      formikHelpers.setSubmitting(false);
      return;
    }
    values.text = replaceMentionValues(values.text, ({name}) => `@${name}`);
    postCreateMutation.mutate(
      {
        forumID: data.pages[0].forumID,
        postData: values,
      },
      {
        onSuccess: async () => {
          formikHelpers.resetForm();
          // https://github.com/jocosocial/swiftarr/issues/237
          // https://github.com/jocosocial/swiftarr/issues/168
          // Refetch needed to "mark" the forum as read.
          await refetch();
          if (data.pages[0]) {
            // This used to not include the forum itself. idk if that's a problem.
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          }
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
          // When you make a post, disable the "scroll lock" so that the screen includes your new post.
          // This will get reset anyway whenever the screen is re-mounted.
          setMaintainViewPosition(false);
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
      <ListTitleView title={data.pages[0].title} />
      {data.pages[0].isLocked && <ForumLockedView />}
      <ForumPostFlatList
        postList={forumPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        invertList={invertList}
        forumData={data.pages[0]}
        hasPreviousPage={hasPreviousPage}
        maintainViewPosition={maintainViewPosition}
        getListHeader={getListHeader}
        flatListRef={flatListRef}
        hasNextPage={hasNextPage}
      />
      {(!data.pages[0].isLocked || hasModerator) && (
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
