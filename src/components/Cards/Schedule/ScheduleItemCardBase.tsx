import React, {ReactNode} from 'react';
import {Card, Text, TouchableRipple} from 'react-native-paper';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {getDurationString} from '../../../libraries/DateTime';
import {TimeMarker} from '../../Views/Schedule/TimeMarker';

interface ScheduleItemCardBaseProps {
  title: string;
  author?: string;
  participation?: string;
  location?: string;
  onPress?: () => void;
  cardStyle?: StyleProp<ViewStyle>;
  titleRight?: () => ReactNode;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
  showDay?: boolean;
  onLongPress?: () => void;
}

export const ScheduleItemCardBase = ({
  title,
  author,
  participation,
  cardStyle,
  location,
  onPress,
  titleRight,
  startTime,
  endTime,
  timeZone,
  onLongPress,
  showDay = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    cardContent: {
      ...commonStyles.paddingVerticalZero,
      ...commonStyles.paddingLeftZero,
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingBottomZero,
    },
    contentView: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    contentBody: {
      ...commonStyles.flex,
      ...commonStyles.marginLeft,
      ...commonStyles.paddingVertical,
    },
    bodyText: {
      ...commonStyles.onTwitarrButton,
    },
    titleText: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
    },
    titleContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
    },
    titleTextContainer: {
      ...commonStyles.flexStart,
      ...commonStyles.flex,
    },
    badgeContainer: {
      ...commonStyles.flexEnd,
    },
  });

  const duration = getDurationString(startTime, endTime, timeZone, showDay);

  return (
    <Card mode={'contained'} style={cardStyle}>
      <TouchableRipple onPress={onPress} onLongPress={onLongPress}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.contentView}>
            {startTime && endTime && timeZone && (
              <TimeMarker startTime={startTime} endTime={endTime} timeZone={timeZone} />
            )}
            <View style={styles.contentBody}>
              <View style={styles.titleContainer}>
                <View style={styles.titleTextContainer}>
                  <Text style={styles.titleText} variant={'titleMedium'}>
                    {title}
                  </Text>
                </View>
                <View style={commonStyles.badgeContainer}>{titleRight && titleRight()}</View>
              </View>
              {duration && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {duration}
                </Text>
              )}
              {location && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {location}
                </Text>
              )}
              {author && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {author}
                </Text>
              )}
              {participation && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {participation}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
};
