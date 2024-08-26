import React from 'react';
import {List, Text} from 'react-native-paper';
import {commonStyles} from '../../../../styles';
import {ForumListData} from '../../../../libraries/Structs/ControllerStructs';
import {StyleSheet, View} from 'react-native';
import pluralize from 'pluralize';
import {RelativeTimeTag} from '../../../Text/Tags/RelativeTimeTag';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {AppIcon} from '../../../Icons/AppIcon';
import {useAppTheme} from '../../../../styles/Theme';
import {ForumNewBadge} from '../../../Badges/ForumNewBadge';
import {getEventTimeString} from '../../../../libraries/DateTime';
import {UserBylineTag} from '../../../Text/Tags/UserBylineTag';
import {CommonStackComponents} from '../../../Navigation/CommonScreens';
import {ForumThreadListItemSwipeable} from '../../../Swipeables/ForumThreadListItemSwipeable.tsx';

interface ForumThreadListItemProps {
  forumListData: ForumListData;
  categoryID?: string;
}

export const ForumThreadListItem = ({forumListData, categoryID}: ForumThreadListItemProps) => {
  const forumNavigation = useForumStackNavigation();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    item: {
      backgroundColor: theme.colors.background,
    },
    title: commonStyles.bold,
    rightContainer: {
      ...commonStyles.marginLeftSmall,
    },
    rightContent: {
      ...commonStyles.flexRow,
    },
  });

  const getRight = () => {
    const unreadCount = forumListData.postCount - forumListData.readCount;
    if (
      unreadCount ||
      forumListData.isFavorite ||
      forumListData.isMuted ||
      forumListData.isLocked ||
      forumListData.isPinned
    ) {
      return (
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {unreadCount !== 0 && !forumListData.isMuted && <ForumNewBadge unreadCount={unreadCount} unit={'post'} />}
            {forumListData.isFavorite && <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />}
            {forumListData.isMuted && <AppIcon icon={AppIcons.mute} color={theme.colors.twitarrNegativeButton} />}
            {forumListData.isLocked && <AppIcon icon={AppIcons.locked} color={theme.colors.twitarrNegativeButton} />}
            {forumListData.isPinned && <AppIcon icon={AppIcons.pin} />}
          </View>
        </View>
      );
    }
  };
  const getDescription = () => (
    <View>
      {forumListData.eventTime && (
        <Text variant={'bodyMedium'}>{getEventTimeString(forumListData.eventTime, forumListData.timeZoneID)}</Text>
      )}
      <Text variant={'bodyMedium'}>
        {forumListData.postCount} {pluralize('post', forumListData.postCount)}
      </Text>
      <Text variant={'bodyMedium'}>
        Created <RelativeTimeTag variant={'bodyMedium'} date={new Date(forumListData.createdAt)} /> by{' '}
        <UserBylineTag user={forumListData.creator} includePronoun={false} variant={'bodyMedium'} />
      </Text>
      {forumListData.lastPostAt && (
        <Text variant={'bodyMedium'}>
          Last post <RelativeTimeTag variant={'bodyMedium'} date={new Date(forumListData.lastPostAt)} />
          {forumListData.lastPoster && (
            <UserBylineTag
              user={forumListData.lastPoster}
              includePronoun={false}
              variant={'bodyMedium'}
              prefix={' by'}
            />
          )}
        </Text>
      )}
    </View>
  );
  const onPress = () =>
    forumNavigation.push(CommonStackComponents.forumThreadScreen, {
      forumID: forumListData.forumID,
      forumListData: forumListData,
    });

  return (
    <ForumThreadListItemSwipeable forumListData={forumListData} categoryID={categoryID}>
      <List.Item
        style={styles.item}
        title={forumListData.title}
        titleStyle={styles.title}
        titleNumberOfLines={0}
        description={getDescription}
        onPress={onPress}
        right={getRight}
      />
    </ForumThreadListItemSwipeable>
  );
};
