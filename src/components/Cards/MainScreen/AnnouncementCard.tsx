import {Card} from 'react-native-paper';
import React from 'react';
import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ContentText} from '../../Text/ContentText';
import {getUserBylineString} from '../../Text/Tags/UserBylineTag';
import moment from 'moment-timezone';

export const AnnouncementCard = ({announcement}: {announcement: AnnouncementData}) => {
  const {commonStyles} = useStyles();

  return (
    <Card style={commonStyles.twitarrPositive}>
      <Card.Title
        title={`From ${getUserBylineString(announcement.author, false, true)}:`}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content>
        <ContentText textStyle={[commonStyles.onTwitarrButton]} text={announcement.text} />
      </Card.Content>
      <Card.Title
        title={`Display Until: ${moment(announcement.displayUntil).format('ddd MMM D hh:mm A')}`}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.italics]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
    </Card>
  );
};
