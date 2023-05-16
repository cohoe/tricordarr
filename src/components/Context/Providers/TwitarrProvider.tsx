import React, {useState, PropsWithChildren} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';
import {useFezListReducer} from '../../Reducers/FezListReducers';
import {useFezPostsReducer} from '../../Reducers/FezPostsReducers';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, dispatchFezList] = useFezListReducer([]);
  const [fezPostsData, dispatchFezPostsData] = useFezPostsReducer();
  const [searchString, setSearchString] = useState('');

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        dispatchFezList,
        fezPostsData,
        dispatchFezPostsData,
        searchString,
        setSearchString,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
