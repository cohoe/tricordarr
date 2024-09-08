import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs';
import axios, {AxiosResponse} from 'axios';
import {ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';
import {WithPaginator} from '../Pagination';
import {useConfig} from '../../Context/Contexts/ConfigContext';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>('/forum/categories');
};

export interface ForumCategoryQueryParams {
  sort?: ForumSortOrder;
  start?: number;
  limit?: number;
  afterdate?: string; // mutually exclusive
  beforedate?: string; // mutually exclusive
}

// https://github.com/jocosocial/swiftarr/issues/236
export interface CategoryDataQueryResponse extends CategoryData, WithPaginator {}

export const useForumCategoryQuery = (categoryId: string, queryParams: ForumCategoryQueryParams = {}) => {
  const {appConfig} = useConfig();
  return useTokenAuthPaginationQuery<CategoryDataQueryResponse>(
    `/forum/categories/${categoryId}`,
    {
      queryFn: async ({
        pageParam = {start: queryParams.start || 0, limit: appConfig.apiClientConfig.defaultPageSize},
      }): Promise<CategoryDataQueryResponse> => {
        const {data: responseData} = await axios.get<CategoryData, AxiosResponse<CategoryData>>(
          `/forum/categories/${categoryId}`,
          {
            params: {
              ...(pageParam.start ? {start: pageParam.start} : undefined),
              ...(pageParam.limit ? {limit: pageParam.limit} : undefined),
              ...(queryParams.sort ? {sort: queryParams.sort} : undefined),
              ...(queryParams.afterdate ? {afterdate: queryParams.afterdate} : undefined),
              ...(queryParams.beforedate ? {beforedate: queryParams.beforedate} : undefined),
            },
          },
        );
        return {
          ...responseData,
          paginator: {
            total: responseData.numThreads,
            start: pageParam.start,
            limit: pageParam.limit,
          },
        };
      },
    },
    queryParams,
  );
};
