import axios, {AxiosError, AxiosResponse} from 'axios';
import {useInfiniteQuery, useMutation} from '@tanstack/react-query';
import {
  ErrorResponse,
  FezContentData,
  FezData,
  FezListData,
  Paginator,
} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezMutationProps {
  fezContentData: FezContentData;
}

const queryHandler = async ({fezContentData}: FezMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post('/fez/create', fezContentData);
};

export const useFezMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason);
    },
  });
};

interface SeamailQueryProps {
  pageSize?: number;
  fezID: string;
}

/**
 * useInfiniteQuery passes a single variable back to the query function
 * with page data. That should be this information (to be used for paging)
 * or undefined to indicate there is no additional page available.
 */
interface PaginationParams {
  start?: number;
  limit: number;
}

/**
 * Tells useInfiniteQuery if there's a next page.
 */
const getNextPageParam = (paginator: Paginator) => {
  const {limit, start, total} = paginator;
  const nextStart = start + limit;
  return nextStart < total ? {start: nextStart, limit: limit} : undefined;
};

/**
 * Tells useInfiniteQuery if there's a previous page.
 */
const getPreviousPageParam = (paginator: Paginator) => {
  const {limit, start} = paginator;
  const prevStart = start - limit;
  return prevStart >= 0 ? {start: prevStart, limit: limit} : undefined;
};

interface SeamailListQueryOptions {
  pageSize?: number;
  forUser?: keyof typeof PrivilegedUserAccounts;
  search?: string;
}

export const useSeamailListQuery = ({pageSize, forUser, search}: SeamailListQueryOptions = {pageSize: 50}) => {
  const {setErrorMessage} = useErrorHandler();
  return useInfiniteQuery<FezListData, AxiosError<ErrorResponse>>(
    ['/fez/joined?type=closed&type=open'],
    async ({pageParam = {limit: pageSize}}) => {
      const {start, limit} = pageParam as PaginationParams;
      const queryParams = {
        ...(start !== undefined && {start: start}),
        ...(limit !== undefined && {limit: limit}),
        ...(search && {search: search}),
        // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
        ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
        type: [FezType.closed, FezType.open],
      };
      const {data: responseData} = await axios.get<FezListData>('/fez/joined', {
        params: queryParams,
      });
      return responseData;
    },
    {
      getNextPageParam: lastPage => getNextPageParam(lastPage.paginator),
      getPreviousPageParam: lastPage => getPreviousPageParam(lastPage.paginator),
      onError: error => {
        setErrorMessage(error?.response?.data.reason);
      },
    },
  );
};

export const useSeamailQuery = ({pageSize = 10, fezID}: SeamailQueryProps) => {
  return useInfiniteQuery<FezData, Error>(
    // @TODO the key needs start too
    [`/fez/${fezID}?limit=${pageSize}`],
    async ({pageParam = {start: undefined, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<FezData>(
        `/fez/${fezID}?limit=${pageParam.limit}&start=${pageParam.start}`,
      );
      return responseData;
    },
    {
      getNextPageParam: lastPage => {
        if (lastPage.members) {
          const {limit, start, total} = lastPage.members.paginator;
          const nextStart = start + limit;
          return nextStart < total ? {start: nextStart, limit} : undefined;
        }
        throw new Error('getNextPageParam no member');
      },
      getPreviousPageParam: firstPage => {
        if (firstPage.members) {
          const {limit, start} = firstPage.members.paginator;
          const prevStart = start - limit;
          return prevStart >= 0 ? {start: prevStart, limit} : undefined;
        }
        throw new Error('getPreviousPageParam no member');
      },
    },
  );
};
