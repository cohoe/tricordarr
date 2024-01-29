import React from 'react';
import {ForumRelationQueryType} from '../../../Queries/Forum/ForumThreadRelationQueries';
import {ForumThreadsRelationsView} from '../../../Views/Forum/ForumThreadsRelationsView';

export const ForumThreadRecentScreen = () => {
  return <ForumThreadsRelationsView relationType={ForumRelationQueryType.recent} />;
};
