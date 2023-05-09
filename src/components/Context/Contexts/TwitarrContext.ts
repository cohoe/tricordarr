import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {InfiniteData} from '@tanstack/react-query';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {FezListActionsType} from '../../Reducers/FezReducers';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList?: FezListData;
  dispatchFezList: Dispatch<FezListActionsType>;
  fezPageData?: InfiniteData<FezData>;
  setFezPageData: Dispatch<SetStateAction<InfiniteData<FezData> | undefined>>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
