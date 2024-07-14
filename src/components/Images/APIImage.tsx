import {AppImageViewer} from './AppImageViewer';
import {Image, ImageStyle, StyleProp, TouchableOpacity} from 'react-native';
import {ActivityIndicator, Card} from 'react-native-paper';
import React, {useEffect, useState} from 'react';
import {useImageQuery} from '../Queries/ImageQuery';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../libraries/Types';
import {AppIcon} from '../Icons/AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useModal} from '../Context/Contexts/ModalContext';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {APIFastImage} from './APIFastImage.tsx';

interface APIImageProps {
  thumbPath: string;
  fullPath: string;
  style?: StyleProp<ImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
}

const animatedRegex = new RegExp('\\.(gif)$', 'i');

export const APIImage = ({thumbPath, fullPath, style, mode = 'cardcover'}: APIImageProps) => {
  const {getIsDisabled} = useFeature();
  // The thumbnails Swiftarr generates are not animated.
  const isAnimated = animatedRegex.test(thumbPath);
  const isDisabled = getIsDisabled(SwiftarrFeature.images);
  const thumbImageQuery = useImageQuery(isAnimated ? fullPath : thumbPath, !isDisabled);
  const fullImageQuery = useImageQuery(fullPath, false);
  const {commonStyles} = useStyles();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [enableFullQuery, setEnableFullQuery] = useState(false);
  const {setModalContent, setModalVisible} = useModal();

  const handleThumbPress = () => {
    if (fullImageQuery.data) {
      setEnableFullQuery(true);
      return;
    }
    fullImageQuery.refetch().then(() => {
      setEnableFullQuery(true);
    });
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([fullImageQuery.data]);
      setIsViewerVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  const handleDisableModal = () => {
    setModalContent(
      <HelpModalView
        text={[
          'Images have been disabled by the server admins. This could be for all clients or just Tricordarr. Check the forums, announcements, or Info Desk for more details.',
        ]}
      />,
    );
    setModalVisible(true);
  };

  if (isDisabled) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <AppIcon icon={AppIcons.imageDisabled} onPress={handleDisableModal} />
      </Card.Content>
    );
  }

  if (
    thumbImageQuery.isLoading ||
    thumbImageQuery.isFetching ||
    fullImageQuery.isFetching ||
    fullImageQuery.isRefetching
  ) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <ActivityIndicator />
      </Card.Content>
    );
  }

  if (!thumbImageQuery.data) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <AppIcon icon={AppIcons.error} />
      </Card.Content>
    );
  }

  // If we have already fetched the full resolution version, show that instead of the thumbnail.
  const imageSource = fullImageQuery.data?.dataURI
    ? {uri: fullImageQuery.data.dataURI}
    : {uri: thumbImageQuery.data.dataURI};

  return (
    <>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity onPress={handleThumbPress}>
        {mode === 'cardcover' && <Card.Cover style={style} source={imageSource} />}
        {mode === 'image' && (
          <Image resizeMode={'cover'} style={[commonStyles.headerImage, style]} source={imageSource} />
        )}
        {mode === 'scaledimage' && <APIFastImage image={imageSource} />}
      </TouchableOpacity>
    </>
  );
};
