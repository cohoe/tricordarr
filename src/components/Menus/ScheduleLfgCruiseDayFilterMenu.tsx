import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ViewStyle} from 'react-native';
import {useCruise} from '../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {useScheduleFilter} from '../Context/Contexts/ScheduleFilterContext';
import {useAppTheme} from '../../styles/Theme';

export const ScheduleLfgCruiseDayFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, cruiseDayToday} = useCruise();
  const {lfgCruiseDayFilter, setLfgCruiseDayFilter} = useScheduleFilter();
  const theme = useAppTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    if (newCruiseDay === lfgCruiseDayFilter) {
      setLfgCruiseDayFilter(undefined);
    } else {
      setLfgCruiseDayFilter(newCruiseDay);
    }
    closeMenu();
  };

  const menuAnchor = (
    <Item
      title={'Cruise Day'}
      color={lfgCruiseDayFilter !== undefined ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.cruiseDay}
      onPress={openMenu}
    />
  );

  const activeStyle: ViewStyle = {backgroundColor: theme.colors.surfaceVariant};

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {cruiseDays.map(day => {
        const itemStyle = lfgCruiseDayFilter === day.cruiseDay ? activeStyle : undefined;
        return (
          <Menu.Item
            style={itemStyle}
            key={day.cruiseDay}
            onPress={() => handleCruiseDaySelection(day.cruiseDay)}
            title={`${format(day.date, 'EEEE')}${cruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
          />
        );
      })}
    </Menu>
  );
};
