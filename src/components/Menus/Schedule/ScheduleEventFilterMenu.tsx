import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {EventType} from '../../../libraries/Enums/EventType.ts';
import {useAppTheme} from '../../../styles/Theme.ts';
import {useFilter} from '../../Context/Contexts/FilterContext.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

export const ScheduleEventFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const theme = useAppTheme();
  const {
    eventTypeFilter,
    setEventTypeFilter,
    eventFavoriteFilter,
    setEventFavoriteFilter,
    eventPersonalFilter,
    setEventPersonalFilter,
    eventLfgFilter,
    setEventLfgFilter,
  } = useFilter();
  const {commonStyles} = useStyles();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // This also shows joined LFGs, hopefully that's not too surprising
  const handleFavoriteSelection = () => {
    setEventFavoriteFilter(!eventFavoriteFilter);
    closeMenu();
  };

  const handlePersonalSelection = () => {
    setEventPersonalFilter(!eventPersonalFilter);
    closeMenu();
  };

  const handleLfgSelection = () => {
    setEventLfgFilter(!eventLfgFilter);
    closeMenu();
  };

  const handleFilterSelection = (newEventTypeFilter: string) => {
    if (newEventTypeFilter === eventTypeFilter) {
      setEventTypeFilter('');
    } else {
      setEventTypeFilter(newEventTypeFilter);
    }
    closeMenu();
  };

  const clearFilters = () => {
    setEventTypeFilter('');
    setEventFavoriteFilter(false);
    setEventLfgFilter(false);
    setEventPersonalFilter(false);
  };

  const anyActiveFilter = eventFavoriteFilter || eventTypeFilter || eventPersonalFilter || eventLfgFilter;

  const menuAnchor = (
    <Item
      title={'Filter'}
      color={anyActiveFilter ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Favorite Events'}
        onPress={handleFavoriteSelection}
        style={eventFavoriteFilter ? commonStyles.surfaceVariant : undefined}
        trailingIcon={eventFavoriteFilter ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Personal Events'}
        onPress={handlePersonalSelection}
        style={eventPersonalFilter ? commonStyles.surfaceVariant : undefined}
        trailingIcon={eventPersonalFilter ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'LFGs'}
        onPress={handleLfgSelection}
        style={eventLfgFilter ? commonStyles.surfaceVariant : undefined}
        trailingIcon={eventLfgFilter ? AppIcons.check : undefined}
      />
      <Divider bold={true} />
      {Object.keys(EventType).map(eventType => {
        return (
          <Menu.Item
            key={eventType}
            style={eventTypeFilter === eventType ? commonStyles.surfaceVariant : undefined}
            title={EventType[eventType as keyof typeof EventType]}
            onPress={() => handleFilterSelection(eventType)}
            trailingIcon={eventTypeFilter === eventType ? AppIcons.check : undefined}
          />
        );
      })}
    </Menu>
  );
};
