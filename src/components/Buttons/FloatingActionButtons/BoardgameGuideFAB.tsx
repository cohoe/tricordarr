import React from 'react';
import {BaseFAB} from './BaseFAB.tsx';
import {MainStackComponents, useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';

interface BoardgameGuideFABProps {
  showLabel?: boolean;
}

export const BoardgameGuideFAB = (props: BoardgameGuideFABProps) => {
  const mainStack = useMainStack();
  return (
    <BaseFAB
      onPress={() => mainStack.push(MainStackComponents.boardgameRecommendScreen)}
      label={'Game Guide'}
      showLabel={props.showLabel}
      icon={AppIcons.games}
    />
  );
};
