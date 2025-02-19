import {StyleSheet, View, Image as NativeImage} from 'react-native';
import {APIImage} from '../../Images/APIImage.tsx';
import React from 'react';
import {ImageUploadData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {ImageButtons} from '../../Buttons/ImageButtons.tsx';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {styleDefaults} from '../../../styles';
import {useSnackbar} from '../../Context/Contexts/SnackbarContext.ts';
import {useField} from 'formik';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

interface AvatarImageFieldProps<TFormData> {
  name: keyof TFormData;
  imageData: ImageUploadData;
}

/**
 * Shares lot with UserProfileAvatar but not in a Form context.
 */
export const AvatarImageField = <TFormData,>({imageData, name}: AvatarImageFieldProps<TFormData>) => {
  const {commonStyles} = useStyles();
  const {setSnackbarPayload} = useSnackbar();
  const [field, _2, helpers] = useField<ImageUploadData>(name as string);

  const styles = StyleSheet.create({
    image: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.headerImage,
    },
    imageContainer: {
      ...commonStyles.flexRow,
      // ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyCenter,
    },
  });

  const clearImage = async () => {
    await helpers.setValue({});
    // await setFieldValue(name, {});
  };

  const processImage = async (image: Image) => {
    if (image.data) {
      await helpers.setValue({
        image: image.data,
      });
    }
  };

  const takeImage = async () => {
    const permissionStatus = await requestPermission(PERMISSIONS.ANDROID.CAMERA);
    console.log('[AvatarImageField.tsx] Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        cropping: true,
        width: styleDefaults.imageSquareCropDimension,
        height: styleDefaults.imageSquareCropDimension,
        includeBase64: true,
        mediaType: 'photo',
      });
      await processImage(image);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: styleDefaults.imageSquareCropDimension,
        height: styleDefaults.imageSquareCropDimension,
        includeBase64: true,
        mediaType: 'photo',
      });
      await processImage(image);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  return (
    <View>
      <View style={styles.imageContainer}>
        {field.value.filename && (
          <APIImage
            thumbPath={`/image/thumb/${imageData.filename}`}
            fullPath={`/image/full/${imageData.filename}`}
            mode={'image'}
            style={styles.image}
          />
        )}
        {field.value.image && (
          <NativeImage
            resizeMode={'cover'}
            style={styles.image}
            source={{uri: `data:image;base64,${field.value.image}`}}
          />
        )}
      </View>
      <ImageButtons
        clearImage={clearImage}
        pickImage={pickImage}
        takeImage={takeImage}
        style={commonStyles.justifyCenter}
        disableDelete={!imageData.filename}
      />
    </View>
  );
};
