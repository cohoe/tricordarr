import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';
import Swipeable, {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';
import {SwipeableButton} from '../Buttons/SwipeableButton.tsx';
import {AppIcons} from '../../libraries/Enums/Icons.ts';
import {useAppTheme} from '../../styles/Theme.ts';
import {ForumListData} from '../../libraries/Structs/ControllerStructs.tsx';
import {useForumRelationMutation} from '../Queries/Forum/ForumThreadRelationMutations.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {CommonStackComponents, useCommonStack} from '../Navigation/CommonScreens.tsx';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext.ts';
import {useForumPinMutation} from '../Queries/Forum/ForumThreadPinMutations.tsx';
import {useForumThreadQuery} from '../Queries/Forum/ForumThreadQueries.tsx';

interface ForumThreadListItemSwipeableProps extends PropsWithChildren {
  forumListData: ForumListData;
  categoryID?: string;
  enabled?: boolean;
}

export const ForumThreadListItemSwipeable = (props: ForumThreadListItemSwipeableProps) => {
  const theme = useAppTheme();
  const relationMutation = useForumRelationMutation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const commonNavigation = useCommonStack();
  const eventID = props.forumListData.eventID;
  const {hasModerator} = usePrivilege();
  const pinMutation = useForumPinMutation();
  const {refetch} = useForumThreadQuery(props.forumListData.forumID, undefined, {enabled: false});

  const invalidationQueryKeys = useMemo(() => {
    let keys = [[`/forum/${props.forumListData.forumID}`], ['/forum/search']];
    if (props.categoryID) {
      keys.push([`/forum/categories/${props.categoryID}`]);
    }
    return keys;
  }, [props.categoryID, props.forumListData.forumID]);

  const handleMarkAsRead = useCallback(
    async (swipeable: SwipeableMethods) => {
      setRefreshing(true);
      await refetch();
      await queryClient.invalidateQueries([`/forum/categories/${props.categoryID}`]);
      setRefreshing(false);
      swipeable.reset();
    },
    [props.categoryID, queryClient, refetch],
  );

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'favorite',
          action: props.forumListData.isFavorite ? 'delete' : 'create',
        },
        {
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [relationMutation, props.forumListData.forumID, props.forumListData.isFavorite, invalidationQueryKeys, queryClient],
  );

  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'mute',
          action: props.forumListData.isMuted ? 'delete' : 'create',
        },
        {
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [relationMutation, props.forumListData.forumID, props.forumListData.isMuted, invalidationQueryKeys, queryClient],
  );

  const handlePin = (swipeable: SwipeableMethods) => {
    setRefreshing(true);
    pinMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        action: props.forumListData.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: async () => {
          const invalidations = invalidationQueryKeys.map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all([invalidations].flat());
        },
        onSettled: () => {
          setRefreshing(false);
          swipeable.reset();
        },
      },
    );
  };

  const renderLeftPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        {eventID && (
          <SwipeableButton
            text={'Event'}
            iconName={AppIcons.events}
            onPress={() => {
              swipeable.reset();
              commonNavigation.push(CommonStackComponents.eventScreen, {
                eventID: eventID,
              });
            }}
            style={{backgroundColor: theme.colors.twitarrNeutralButton}}
            refreshing={refreshing}
            textStyle={{color: theme.colors.onTwitarrNeutralButton}}
            iconColor={theme.colors.onTwitarrNeutralButton}
          />
        )}
        {hasModerator && props.categoryID && (
          <SwipeableButton
            text={props.forumListData.isPinned ? 'Unpin' : 'Pin'}
            refreshing={refreshing}
            onPress={() => handlePin(swipeable)}
            iconName={AppIcons.moderator}
            style={{backgroundColor: theme.colors.elevation.level1}}
          />
        )}
      </>
    );
  };

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        <SwipeableButton
          text={props.forumListData.isMuted ? 'Unmute' : 'Mute'}
          iconName={AppIcons.mute}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleMute(swipeable)}
          refreshing={refreshing}
        />
        <SwipeableButton
          text={props.forumListData.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={refreshing}
          style={{backgroundColor: theme.colors.elevation.level1}}
        />
        <SwipeableButton
          // Ehhhhhh
          text={'Mark\n  as\nRead'}
          iconName={AppIcons.check}
          onPress={() => handleMarkAsRead(swipeable)}
          refreshing={refreshing}
          style={{backgroundColor: theme.colors.elevation.level3}}
        />
      </>
    );
  };

  return (
    <Swipeable
      enabled={props.enabled}
      renderRightActions={renderRightPanel}
      renderLeftActions={renderLeftPanel}
      overshootFriction={8}
      overshootRight={false}
      overshootLeft={false}>
      {props.children}
    </Swipeable>
  );
};
