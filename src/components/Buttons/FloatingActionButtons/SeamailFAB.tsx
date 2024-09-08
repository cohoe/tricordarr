import * as React from 'react';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {ChatStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {BaseFABGroup} from './BaseFABGroup';
import {CommonStackComponents} from '../../Navigation/CommonScreens';

interface SeamailFABProps {
  showLabel?: boolean;
}

export const SeamailFAB = (props: SeamailFABProps) => {
  const theme = useAppTheme();
  const navigation = useChatStack();
  const {asPrivilegedUser, asModerator, asTwitarrTeam} = usePrivilege();

  const color = asPrivilegedUser ? theme.colors.onErrorContainer : theme.colors.inverseOnSurface;
  const backgroundColor = asPrivilegedUser ? theme.colors.errorContainer : theme.colors.inverseSurface;

  const actions = [
    FabGroupAction({
      icon: AppIcons.seamailCreate,
      label: 'New Seamail',
      onPress: () =>
        navigation.push(CommonStackComponents.seamailCreateScreen, {
          initialAsModerator: asModerator,
          initialAsTwitarrTeam: asTwitarrTeam,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.seamailSearch,
      label: 'Search',
      onPress: () =>
        navigation.push(ChatStackScreenComponents.seamailSearchScreen, {
          forUser: asPrivilegedUser,
        }),
    }),
  ];

  return (
    <BaseFABGroup
      color={color}
      backgroundColor={backgroundColor}
      actions={actions}
      openLabel={'Seamail'}
      icon={AppIcons.seamail}
      showLabel={props.showLabel}
    />
  );
};
