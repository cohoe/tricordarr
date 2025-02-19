import React, {PropsWithChildren, useState} from 'react';
import {SnackbarContext} from '../Contexts/SnackbarContext.ts';
import {SnackbarPayload} from '../../../libraries/Types';

export const SnackbarProvider = ({children}: PropsWithChildren) => {
  const [snackbarPayload, setSnackbarPayload] = useState<SnackbarPayload>();
  return <SnackbarContext.Provider value={{snackbarPayload, setSnackbarPayload}}>{children}</SnackbarContext.Provider>;
};
