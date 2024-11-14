import {Menu} from 'react-native-paper';
import React from 'react';
import {TextField, TextFieldProps} from './TextField';
import {useField, useFormikContext} from 'formik';
import {useModal} from '../../Context/Contexts/ModalContext';

interface SuggestedTextFieldProps extends TextFieldProps {
  suggestions?: string[];
}

export const SuggestedTextField = ({
  name,
  mode = 'outlined',
  multiline,
  numberOfLines,
  secureTextEntry,
  label,
  left,
  right,
  viewStyle,
  inputMode,
  autoCapitalize,
  maxLength,
  suggestions = [],
}: SuggestedTextFieldProps) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const {setFieldValue} = useFormikContext();
  const [field] = useField<string>(name);
  const {modalVisible} = useModal();

  const handleSelect = (newValue: string) => {
    setFieldValue(name, newValue);
    closeMenu();
  };

  const handleOpen = () => {
    if (field.value || modalVisible) {
      return;
    }
    openMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TextField
          name={name}
          mode={mode}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          label={label}
          left={left}
          right={right}
          viewStyle={viewStyle}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={handleOpen}
          onChangeText={handleSelect}
        />
      }>
      {suggestions.map((suggestion, index) => {
        return <Menu.Item key={index} title={suggestion} onPress={() => handleSelect(suggestion)} />;
      })}
    </Menu>
  );
};
