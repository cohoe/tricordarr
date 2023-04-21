import React, {useState} from 'react';
import {View} from 'react-native';
import {FastField, useField, useFormikContext} from 'formik';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {UserChip} from '../../Chips/UserChip';
import {useUserData} from '../../Context/Contexts/UserDataContext';

interface UserChipsFieldProps {
  name: string;
  allowRemoveSelf?: boolean;
}
export const UserChipsField = ({name, allowRemoveSelf = false}: UserChipsFieldProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const [userHeaders, setUserHeaders] = useState<UserHeader[]>([profilePublicData.header]);
  const {setFieldValue} = useFormikContext();
  const [field, meta, helpers] = useField<string[]>(name);

  const styles = {
    parentContainer: [],
    searchBarContainer: [commonStyles.marginBottomSmall],
    chipContainer: [commonStyles.flexRow, commonStyles.flexStart, commonStyles.flexWrap, commonStyles.paddingTopSmall],
  };

  const addUserHeader = (newUserHeader: UserHeader) => {
    // https://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
    const existingIndex = userHeaders.findIndex(header => header.userID === newUserHeader.userID);
    if (existingIndex === -1) {
      setUserHeaders(userHeaders.concat([newUserHeader]));
    }
  };

  const removeUserHeader = (user: UserHeader) => {
    if (!allowRemoveSelf && user.userID === profilePublicData.header.userID) {
      return;
    }
    setUserHeaders(userHeaders.filter(header => header.userID !== user.userID));
  };

  if (field.value.length !== userHeaders.length) {
    setFieldValue(
      name,
      userHeaders.flatMap(header => header.userID),
    );
  }

  console.info('### TRIGGERING IN USERCHIPSFIELD');

  // https://codereacter.medium.com/reducing-the-number-of-renders-when-using-formik-9790bf111ab9
  return (
    <FastField name={name}>
      {() => (
        <View style={styles.parentContainer}>
          <View style={styles.searchBarContainer}>
            <UserSearchBar userHeaders={userHeaders} onPress={addUserHeader} />
          </View>
          <View style={styles.chipContainer}>
            {userHeaders.flatMap((user: UserHeader) => (
              <UserChip
                key={user.userID}
                userHeader={user}
                onClose={() => removeUserHeader(user)}
                disabled={user.userID === profilePublicData.header.userID}
              />
            ))}
          </View>
        </View>
      )}
    </FastField>
  );
};
