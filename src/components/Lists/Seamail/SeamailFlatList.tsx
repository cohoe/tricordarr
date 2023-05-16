import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React from 'react';
import {Divider} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {useUserData} from '../../Context/Contexts/UserDataContext';

interface SeamailFlatListProps {
  fezList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: ((info: {distanceFromEnd: number}) => void) | null | undefined;
}

const ListSeparator = () => <Divider bold={true} />;

const SeamailListHeader = () => {
  const {isPrivileged} = useUserData();
  return (
    <View>
      <PaddedContentView padTop={true}>
        <SeamailSearchBar />
      </PaddedContentView>
      {isPrivileged && (
        <PaddedContentView>
          <SeamailAccountButtons />
        </PaddedContentView>
      )}
      <ListSeparator />
    </View>
  );
};

export const SeamailFlatList = ({fezList, refreshControl, onEndReached}: SeamailFlatListProps) => {
  return (
    <FlatList
      refreshControl={refreshControl}
      ItemSeparatorComponent={ListSeparator}
      ListHeaderComponent={SeamailListHeader}
      ListFooterComponent={ListSeparator}
      onEndReached={onEndReached}
      data={fezList}
      renderItem={({item}) => <SeamailListItem fez={item} />}
    />
  );
};
