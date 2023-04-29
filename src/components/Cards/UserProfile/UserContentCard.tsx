import React from 'react';
import {Card, List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';

interface UserContentCardProps {
  user: ProfilePublicData;
}

export const UserContentCard = ({user}: UserContentCardProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <Card.Title title={`Content by @${user.header.username}`} />
      <Card.Content style={[commonStyles.paddingHorizontalZero]}>
        <ListSection>
          <List.Item title={'Twarrts'} onPress={() => console.log('twarts', user.header.userID)} />
          <List.Item title={'Forums'} onPress={() => console.log('forums', user.header.userID)} />
          <List.Item title={'LFGs'} onPress={() => console.log('LFGs', user.header.userID)} />
        </ListSection>
      </Card.Content>
    </Card>
  );
};
