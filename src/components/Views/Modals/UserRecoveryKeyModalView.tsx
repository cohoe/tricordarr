import React from 'react';
import {TextStyle, View} from 'react-native';
import {ModalCard} from '../../Cards/ModalCard';
import {useModal} from '../../Context/Contexts/ModalContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import Clipboard from '@react-native-clipboard/clipboard';

interface UserRecoveryKeyModalViewProps {
  userRecoveryKey: string;
}

const UserRecoveryKeyModalContent = ({recoveryKey}: {recoveryKey: string}) => {
  const {commonStyles} = useStyles();

  const keyStyle: TextStyle = {
    ...commonStyles.textCenter,
    ...commonStyles.marginVertical,
    ...commonStyles.noteContainer,
    ...commonStyles.onNoteContainer,
    ...commonStyles.roundedBorder,
    ...commonStyles.paddingVerticalSmall,
  };

  return (
    <>
      <Text>
        Your account recovery key can be used if you lose access to your account and can't recover your password. It can
        be used only once and will be shown to you only right now. Write it down (long press) or screenshot before
        proceeding.
      </Text>
      <Text style={keyStyle} variant={'titleLarge'} onLongPress={() => Clipboard.setString(recoveryKey)}>
        {recoveryKey}
      </Text>
    </>
  );
};

export const UserRecoveryKeyModalView = ({userRecoveryKey}: UserRecoveryKeyModalViewProps) => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const {setModalVisible} = useModal();

  const onPress = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrPositiveButton}
      buttonText={'Acknowledged'}
      onPress={onPress}
    />
  );
  return (
    <View>
      <ModalCard
        title={'Account Recovery'}
        showCloseButton={false}
        content={<UserRecoveryKeyModalContent recoveryKey={userRecoveryKey} />}
        actions={cardActions}
      />
    </View>
  );
};
