import React from 'react';
import {Avatar} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {apiQueryImageUri} from '../../libraries/Network/APIClient';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {styleDefaults} from '../../styles';
import {AppIcons} from '../../libraries/Enums/Icons';

type UserAvatarImageProps = {
  userID: string;
  small?: boolean;
};

export const UserAvatarImage = ({userID, small = false}: UserAvatarImageProps) => {
  const {isLoggedIn} = useUserData();
  const size = small ? styleDefaults.avatarSizeSmall : styleDefaults.avatarSize;

  const {data: avatarImageUri} = useQuery({
    queryKey: [`/image/user/thumb/${userID}`],
    enabled: isLoggedIn && !!userID,
    queryFn: apiQueryImageUri,
  });

  if (!avatarImageUri) {
    return <Avatar.Icon size={size} icon={AppIcons.user} />;
  }

  return <Avatar.Image size={size} source={{uri: avatarImageUri}} />;
};
