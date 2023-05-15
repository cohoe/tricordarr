import React from 'react';
import {View} from 'react-native';
import {Badge} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {RelativeTimeTag} from './RelativeTimeTag';

export const SeamailTimeBadge = ({date, badgeCount}: {date: Date; badgeCount: number}) => {
  const timeStyle = !!badgeCount ? [commonStyles.bold] : undefined;
  return (
    <View style={commonStyles.verticalContainer}>
      <View style={commonStyles.flexRow}>
        <RelativeTimeTag date={date} style={timeStyle} />
        {!!badgeCount && <Badge style={commonStyles.marginLeftSmall}>{badgeCount}</Badge>}
      </View>
    </View>
  );
};
