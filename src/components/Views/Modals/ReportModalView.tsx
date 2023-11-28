import React, {useState} from 'react';
import {FormikHelpers} from 'formik';
import {
  FezData,
  FezPostData,
  ForumData,
  PostData,
  ProfilePublicData,
  ReportData,
} from '../../../libraries/Structs/ControllerStructs';
import {ReportContentForm} from '../../Forms/ReportContentForm';
import {useReportMutation} from '../../Queries/Moderation/ModerationQueries';
import {ReportContentType} from '../../../libraries/Enums/ReportContentType';
import {ReportModalSuccessView} from './ReportModalSuccessView';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {ReportModalErrorView} from './ReportModalErrorView';

interface ReportModalViewProps {
  profile?: ProfilePublicData;
  fezPost?: FezPostData;
  fez?: FezData;
  forum?: ForumData;
  forumPost?: PostData;
}

export const ReportModalView = ({profile, fezPost, fez, forumPost, forum}: ReportModalViewProps) => {
  const reportMutation = useReportMutation();
  const [submitted, setSubmitted] = useState(false);
  const {setErrorMessage} = useErrorHandler();

  if (!profile && !fezPost && !fez && !forumPost && !forum) {
    return <ReportModalErrorView />;
  }

  const onSubmit = (values: ReportData, formikHelpers: FormikHelpers<ReportData>) => {
    let contentID;
    let contentType;
    if (profile) {
      contentID = profile.header.userID;
      contentType = ReportContentType.users;
    } else if (fezPost) {
      contentID = fezPost.postID;
      contentType = ReportContentType.fezPost;
    } else if (fez) {
      contentID = fez.fezID;
      contentType = ReportContentType.fez;
    } else if (forum) {
      contentID = forum.forumID;
      contentType = ReportContentType.forum;
    } else if (forumPost) {
      contentID = forumPost.postID;
      contentType = ReportContentType.forumPost;
    }
    reportMutation.mutate(
      {
        contentType: contentType || ReportContentType.fezPost,
        contentID: contentID || 0,
        reportData: values,
      },
      {
        onSuccess: () => {
          formikHelpers.setSubmitting(false);
          formikHelpers.resetForm();
          setSubmitted(true);
        },
        onError: error => {
          formikHelpers.setSubmitting(false);
          setErrorMessage(error.response?.data.reason || error);
        },
      },
    );
  };

  if (submitted) {
    return <ReportModalSuccessView />;
  }

  return <ReportContentForm onSubmit={onSubmit} />;
};
