import * as React from 'react';
import {ReactNode, useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';
import {ReportModalView} from '../Views/Modals/ReportModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {MuteUserModalView} from '../Views/Modals/MuteUserModalView';
import {useUserMuteMutation} from '../Queries/Users/UserMuteQueries';
import {useUserRelations} from '../Context/Contexts/UserRelationsContext';
import {useUserBlockMutation} from '../Queries/Users/UserBlockQueries';
import {BlockUserModalView} from '../Views/Modals/BlockUserModalView';
import {useUserFavoriteMutation} from '../Queries/Users/UserFavoriteQueries';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
  isFavorite: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

export const UserProfileActionsMenu = ({profile, isFavorite, isMuted, isBlocked}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const favoriteMutation = useUserFavoriteMutation();
  const {mutes, setMutes, blocks, setBlocks, favorites, setFavorites} = useUserRelations();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModerate = () => console.log('Navigating to moderate user', profile.header.username);
  const handleFavorite = () => {
    if (isFavorite) {
      favoriteMutation.mutate(
        {
          userID: profile.header.userID,
          action: 'unfavorite',
        },
        {
          onSuccess: () => {
            setFavorites(favorites.filter(m => m.userID !== profile.header.userID));
            closeMenu();
          },
        },
      );
    } else {
      favoriteMutation.mutate(
        {
          userID: profile.header.userID,
          action: 'favorite',
        },
        {
          onSuccess: () => {
            setFavorites(favorites.concat([profile.header]));
            closeMenu();
          },
        },
      );
    }
  };
  const handleRegCode = () => console.log('Navigating to reg code');
  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        leadingIcon={isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
        title={isFavorite ? 'Unfavorite' : 'Favorite'}
        onPress={handleFavorite}
      />
      <Menu.Item leadingIcon={AppIcons.privateNoteEdit} title={'Add Private Note'} />
      <Divider bold={true} />
      <Menu.Item
        leadingIcon={isBlocked ? AppIcons.unblock : AppIcons.block}
        title={isBlocked ? 'Unblock' : 'Block'}
        onPress={() => {
          if (isBlocked) {
            blockMutation.mutate(
              {userID: profile.header.userID, action: 'unblock'},
              {
                onSuccess: () => {
                  setBlocks(blocks.filter(m => m.userID !== profile.header.userID));
                  closeMenu();
                },
              },
            );
          } else {
            handleModal(<BlockUserModalView user={profile.header} />);
          }
        }}
      />
      <Menu.Item
        leadingIcon={isMuted ? AppIcons.unmute : AppIcons.mute}
        title={isMuted ? 'Unmute' : 'Mute'}
        onPress={() => {
          if (isMuted) {
            muteMutation.mutate(
              {userID: profile.header.userID, action: 'unmute'},
              {
                onSuccess: () => {
                  setMutes(mutes.filter(m => m.userID !== profile.header.userID));
                  closeMenu();
                },
              },
            );
          } else {
            handleModal(<MuteUserModalView user={profile.header} />);
          }
        }}
      />
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView profile={profile} />)}
      />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.moderator} title={'Moderate'} onPress={handleModerate} />
      <Menu.Item leadingIcon={AppIcons.twitarteam} title={'Registration'} onPress={handleRegCode} />
    </Menu>
  );
};
