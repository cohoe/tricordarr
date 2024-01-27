import React from 'react';
import {Card, List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {RootStackComponents, useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {
  BottomTabComponents,
  ForumStackComponents,
  LfgStackComponents,

} from '../../../libraries/Enums/Navigation';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface UserContentCardProps {
  user: ProfilePublicData;
}

export const UserContentCard = ({user}: UserContentCardProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const rootNavigation = useRootStack();
  const isSelf = profilePublicData?.header.userID === user.header.userID;
  const {hasModerator} = usePrivilege();

  const getIcon = (icon: string) => <AppIcon style={[commonStyles.marginLeft]} icon={icon} />;

  return (
    <Card>
      <Card.Title title={`Content by @${user.header.username}`} />
      <Card.Content style={[commonStyles.paddingHorizontalZero]}>
        <ListSection>
          <List.Item
            title={'Forums'}
            left={() => getIcon(AppIcons.forum)}
            onPress={() =>
              rootNavigation.push(RootStackComponents.rootContentScreen, {
                screen: BottomTabComponents.forumsTab,
                params: {
                  screen: ForumStackComponents.forumThreadUserScreen,
                  initial: false,
                  params: {
                    user: user.header,
                  },
                },
              })
            }
          />
          {hasModerator && (
            <List.Item
              title={'Forum Posts'}
              left={() => getIcon(AppIcons.moderator)}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.forumsTab,
                  params: {
                    screen: ForumStackComponents.forumPostUserScreen,
                    initial: false,
                    params: {
                      user: user.header,
                    },
                  },
                })
              }
            />
          )}
          {isSelf && (
            <List.Item
              title={'LFGs'}
              left={() => getIcon(AppIcons.lfg)}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.lfgTab,
                  params: {
                    screen: LfgStackComponents.lfgOwnedScreen,
                    initial: false,
                  },
                })
              }
            />
          )}
        </ListSection>
      </Card.Content>
    </Card>
  );
};
