import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useEventQuery} from '../../Queries/Events/EventQueries';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {ListSection} from '../../Lists/ListSection';
import {AppIcon} from '../../Icons/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteMutations.tsx';
import {useAppTheme} from '../../../styles/Theme';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useQueryClient} from '@tanstack/react-query';
import {LoadingView} from '../../Views/Static/LoadingView';
import {guessDeckNumber} from '../../../libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {EventScreenActionsMenu} from '../../Menus/Events/EventScreenActionsMenu';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.eventScreen>;

export const EventScreen = ({navigation, route}: Props) => {
  const {
    data: eventData,
    refetch,
    isFetching,
  } = useEventQuery({
    eventID: route.params.eventID,
  });
  const {commonStyles} = useStyles();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const theme = useAppTheme();
  const queryClient = useQueryClient();

  const handleFavorite = useCallback(
    (event: EventData) => {
      eventFavoriteMutation.mutate(
        {
          eventID: event.eventID,
          action: event.isFavorite ? 'unfavorite' : 'favorite',
        },
        {
          onSuccess: async () => {
            await Promise.all([
              queryClient.invalidateQueries(['/events']),
              queryClient.invalidateQueries([`/events/${event.eventID}`]),
              queryClient.invalidateQueries(['/events/favorites']),
              // Update the user notification data in case this was/is a favorite.
              queryClient.invalidateQueries(['/notification/global']),
            ]);
          },
        },
      );
    },
    [eventFavoriteMutation, queryClient],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {eventData && (
            <>
              <Item
                title={'Favorite'}
                color={eventData.isFavorite ? theme.colors.twitarrYellow : undefined}
                iconName={AppIcons.favorite}
                onPress={() => handleFavorite(eventData)}
              />
              {eventData.forum && (
                <Item
                  title={'Forum'}
                  iconName={AppIcons.forum}
                  onPress={() => {
                    if (eventData.forum) {
                      navigation.push(CommonStackComponents.forumThreadScreen, {
                        forumID: eventData.forum,
                      });
                    }
                  }}
                />
              )}
              <EventScreenActionsMenu event={eventData} />
            </>
          )}
        </HeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite, navigation, theme.colors.twitarrYellow]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
  });

  const handleLocation = () => {
    if (!eventData) {
      return;
    }
    const deck = guessDeckNumber(eventData.location);
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: deck,
    });
  };

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;

  if (!eventData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {eventData && (
          <PaddedContentView padSides={false}>
            <ListSection>
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.events)}
                description={eventData.title}
                title={'Title'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.time)}
                description={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZoneID, true)}
                title={'Date'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.map)}
                description={eventData.location}
                title={'Location'}
                onPress={handleLocation}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.type)}
                description={eventData.eventType}
                title={'Type'}
              />
              {eventData.description && (
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.description)}
                  description={eventData.description}
                  title={'Description'}
                />
              )}
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
