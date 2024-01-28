import React, {useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {ForumCreateForm} from '../../../Forms/ForumCreateForm';
import {FormikHelpers, FormikProps} from 'formik';
import {ForumCreateData, PostContentData} from '../../../../libraries/Structs/ControllerStructs';
import {ForumThreadValues} from '../../../../libraries/Types/FormValues';
import {ContentPostForm} from '../../../Forms/ContentPostForm';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {useForumCreateMutation} from '../../../Queries/Forum/ForumMutationQueries';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {PostAsUserBanner} from '../../../Banners/PostAsUserBanner';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {CommonStackComponents} from '../../../Navigation/CommonScreens';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadCreateScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadCreateScreen = ({route, navigation}: Props) => {
  const forumFormRef = useRef<FormikProps<ForumThreadValues>>(null);
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const [submitting, setSubmitting] = useState(false);
  const {setErrorMessage} = useErrorHandler();
  const forumCreateMutation = useForumCreateMutation();
  const {dispatchForumListData} = useTwitarr();
  const {profilePublicData} = useUserData();

  const onForumSubmit = (values: ForumThreadValues, formikHelpers: FormikHelpers<ForumThreadValues>) => {
    setSubmitting(true);
    if (!postFormRef.current) {
      setErrorMessage('Post form ref undefined.');
      setSubmitting(false);
      return;
    }
    // Whatever we picked in the Forum is what should be set in the Post.
    // Forum doesn't take these params and keys off of the first post.
    postFormRef.current.setFieldValue('postAsModerator', values.postAsModerator);
    postFormRef.current.setFieldValue('postAsTwitarrTeam', values.postAsTwitarrTeam);
    postFormRef.current.values.text = replaceMentionValues(postFormRef.current.values.text, ({name}) => `@${name}`)
    const forumData: ForumCreateData = {
      title: values.title,
      firstPost: postFormRef.current.values,
    };
    forumCreateMutation.mutate(
      {
        forumCreateData: forumData,
        categoryId: route.params.categoryId,
      },
      {
        onSuccess: response => {
          dispatchForumListData({
            type: ForumListDataActions.prependNewForumData,
            forumData: response.data,
            createdAt: new Date().toISOString(),
            lastPostAt: new Date().toISOString(),
            lastPoster: profilePublicData?.header,
            postCount: 1,
            readCount: 1,
          });
          navigation.replace(CommonStackComponents.forumThreadScreen, {
            forumID: response.data.forumID,
          });
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      },
    );
  };

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    console.log('This does nothing');
  };

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = () => {
    setSubmitting(true);
    forumFormRef.current?.submitForm();
  };

  return (
    <AppView>
      <PostAsUserBanner />
      <ScrollingContentView>
        <ForumCreateForm onSubmit={onForumSubmit} formRef={forumFormRef} />
      </ScrollingContentView>
      <ContentPostForm
        onSubmit={onPostSubmit}
        formRef={postFormRef}
        overrideSubmitting={submitting}
        onPress={onSubmit}
        enablePhotos={true}
        maxLength={2000}
        maxPhotos={4}
      />
    </AppView>
  );
};
