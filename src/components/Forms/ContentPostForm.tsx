import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useStyles} from '../Context/Contexts/StyleContext';
import {SubmitIconButton} from '../Buttons/IconButtons/SubmitIconButton';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {IconButton, Text} from 'react-native-paper';
import {PrivilegedUserAccounts} from '../../libraries/Enums/UserAccessLevel';
import {ContentInsertMenuView} from '../Views/Content/ContentInsertMenuView';
import * as Yup from 'yup';
import {EmojiPickerField} from './Fields/EmojiPickerField';
import {ContentInsertPhotosView} from '../Views/Content/ContentInsertPhotosView';
import {ContentPostLengthView} from '../Views/Content/ContentPostLengthView';
import {MentionInput} from 'react-native-controlled-mentions';
import {ContentPostMentionSuggestionsView} from '../Views/ContentPostMentionSuggestionsView';
import {MentionTextField} from './Fields/MentionTextField';

interface ContentPostFormProps {
  onSubmit: (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => void;
  formRef?: React.RefObject<FormikProps<PostContentData>>;
  onPress?: () => void;
  overrideSubmitting?: boolean;
  enablePhotos?: boolean;
  maxLength?: number;
  maxPhotos?: number;
  initialValues?: PostContentData;
}

// https://formik.org/docs/guides/react-native
export const ContentPostForm = ({
  onSubmit,
  formRef,
  onPress,
  overrideSubmitting,
  enablePhotos = true,
  maxLength = 500,
  maxPhotos = 1,
  initialValues,
}: ContentPostFormProps) => {
  const {commonStyles} = useStyles();
  const {asPrivilegedUser} = usePrivilege();
  const [insertMenuVisible, setInsertMenuVisible] = React.useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = React.useState(false);

  const validationSchema = Yup.object().shape({
    text: Yup.string()
      .required('Post is required.')
      .min(1, 'Post cannot be empty.')
      .max(maxLength, 'Post must be less than 500 characters.')
      .test('maxLines', 'Post must be less than 25 lines', value => {
        return value.split(/\r\n|\r|\n/).length <= 25;
      }),
  });

  const defaultInitialValues: PostContentData = {
    images: [],
    postAsModerator: asPrivilegedUser === PrivilegedUserAccounts.moderator,
    postAsTwitarrTeam: asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam,
    text: '',
  };

  const styles = StyleSheet.create({
    formContainer: {
      ...commonStyles.flexColumn,
    },
    formView: {
      ...commonStyles.flexRow,
      ...commonStyles.marginVerticalSmall,
    },
    inputWrapperView: {
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.flexColumn,
    },
    input: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.secondaryContainer,
    },
    lengthHintContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.marginBottomSmall,
    },
    inputWrapperViewSide: {
      ...commonStyles.flexColumn,
      ...commonStyles.flexEnd,
    },
  });

  const handleInsertPress = () => {
    if (emojiPickerVisible || insertMenuVisible) {
      setEmojiPickerVisible(false);
      setInsertMenuVisible(false);
      return;
    }
    setInsertMenuVisible(!insertMenuVisible);
  };

  // https://formik.org/docs/api/withFormik
  // https://www.programcreek.com/typescript/?api=formik.FormikHelpers
  // https://formik.org/docs/guides/react-native
  //
  // This uses the native TextInput rather than Paper since Paper's was way more
  // annoying to try and stylize for this use.
  // At least I used to until I switched to the MentionsInput.
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues || defaultInitialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, dirty}) => (
        <ScrollView style={commonStyles.contentPostForm}>
          <View style={{...styles.formContainer}}>
            {emojiPickerVisible && <EmojiPickerField />}
            <ContentInsertMenuView
              enablePhotos={enablePhotos}
              visible={insertMenuVisible}
              setVisible={setInsertMenuVisible}
              setEmojiVisible={setEmojiPickerVisible}
              maxPhotos={maxPhotos}
            />
            <View style={styles.formView}>
              <View style={styles.inputWrapperViewSide}>
                <IconButton
                  icon={emojiPickerVisible || insertMenuVisible ? AppIcons.insertClose : AppIcons.insert}
                  onPress={handleInsertPress}
                />
              </View>
              <View style={styles.inputWrapperView}>
                <MentionTextField name={'text'} style={styles.input} />
                <ContentInsertPhotosView />
              </View>
              <View style={styles.inputWrapperViewSide}>
                <SubmitIconButton
                  disabled={!values.text}
                  submitting={overrideSubmitting || isSubmitting}
                  onPress={onPress || handleSubmit}
                  withPrivilegeColors={true}
                />
              </View>
            </View>
            {dirty && <ContentPostLengthView content={values.text} maxChars={maxLength} />}
          </View>
        </ScrollView>
      )}
    </Formik>
  );
};
