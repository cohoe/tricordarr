import React from 'react';
import {Text} from 'react-native-paper';
import {FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {View, ViewStyle, TextStyle} from 'react-native';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {useAppTheme} from '../../../styles/Theme';
import {commonStyles, styleDefaults} from '../../../styles';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserAvatarImage} from '../../Images/UserAvatarImage';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface FezPostListItemProps {
  item: FezPostData;
  index: number;
  separators: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
  };
}

export const FezPostListItem = ({item, index, separators}: FezPostListItemProps) => {
  const theme = useAppTheme();
  const {profilePublicData} = useUserData();
  const postBySelf = profilePublicData.header.userID === item.author.userID;

  type Styles = {
    messageView: ViewStyle;
    containerView: ViewStyle;
    messageText: TextStyle;
    messageTextHeader: TextStyle;
    avatarContainer: ViewStyle;
  };

  const styles: Styles = {
    messageView: {
      backgroundColor: postBySelf ? theme.colors.primaryContainer : theme.colors.secondaryContainer,
      // ...commonStyles.paddingSides,
      // ...commonStyles.paddingVertical,
      borderRadius: theme.roundness * 4,
      alignSelf: postBySelf ? 'flex-end' : 'flex-start',
      padding: styleDefaults.marginSize / 2,
    },
    containerView: {
      ...commonStyles.marginHorizontal,
      ...commonStyles.flex,
      ...commonStyles.flexRow,
      alignSelf: postBySelf ? 'flex-end' : 'flex-start',
    },
    messageText: {
      color: postBySelf ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer,
    },
    messageTextHeader: {
      display: postBySelf ? 'none' : 'flex',
      fontWeight: 'bold',
    },
    avatarContainer: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.flexColumn,
      alignSelf: 'flex-end',
      // Don't do Display here because it'll trigger an unncessary avatar load.
    },
  };

  return (
    <View style={styles.containerView}>
      {!postBySelf && (
        <View style={styles.avatarContainer}>
          <UserAvatarImage userID={item.author.userID} small={true} />
        </View>
      )}
      <View style={styles.messageView}>
        <Text style={{...styles.messageText, ...styles.messageTextHeader}}>{item.author.username}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );
};
