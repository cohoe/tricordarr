import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumThreadScreenFilterMenu} from '../../Menus/Forum/ForumThreadScreenFilterMenu';
import {ForumThreadScreenSortMenu} from '../../Menus/Forum/ForumThreadScreenSortMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ForumThreadsRelationsView} from '../../Views/Forum/ForumThreadsRelationsView';
import {ForumThreadsCategoryView} from '../../Views/Forum/ForumThreadsCategoryView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {AppView} from '../../Views/AppView';
import {ForumFilter} from '../../../libraries/Enums/ForumSortFilter';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoryScreen,
  NavigatorIDs.forumStack
>;

const helpText = [
  'Muted forums appear at the end of this list.',
  'Favorited forums appear in the sort order, which by default is Most Recent Post first.',
  'Moderators can pin forums to the category.',
];

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {forumFilter} = useFilter();
  const {setModalVisible, setModalContent} = useModal();
  const isFocused = useIsFocused();
  const {clearPrivileges} = usePrivilege();

  const handleHelp = useCallback(() => {
    setModalContent(<HelpModalView text={helpText} />);
    setModalVisible(true);
  }, [setModalContent, setModalVisible]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadScreenSortMenu />
          <ForumThreadScreenFilterMenu />
          <Item title={'Help'} iconName={AppIcons.help} onPress={handleHelp} />
        </HeaderButtons>
      </View>
    );
  }, [handleHelp]);

  useEffect(() => {
    // This clears the previous state of forum posts and a specific forum.
    if (isFocused) {
      clearPrivileges();
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [isFocused, getNavButtons, navigation, clearPrivileges]);

  if (forumFilter) {
    return (
      <AppView>
        <ForumThreadsRelationsView
          relationType={ForumFilter.toRelation(forumFilter)}
          categoryID={route.params.categoryID}
        />
      </AppView>
    );
  }
  return (
    <AppView>
      <ForumThreadsCategoryView categoryID={route.params.categoryID} />
    </AppView>
  );
};
