import React, {useState, PropsWithChildren, useEffect} from 'react';
import {PrivilegeContext} from '../Contexts/PrivilegeContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';

/**
 * This provider is used for performing a privileged action as some special user.
 * It is not for determining if you are privileged or not. This is intentionally
 * not included in App.tsx with all the other providers. It is recommended to be
 * a child of <AppView> in a particular screen for whatever action is about to
 * be privileged.
 */
export const PrivilegeProvider = ({children}: PropsWithChildren) => {
  const [asModerator, setAsModerator] = useState(false);
  const [asTwitarrTeam, setAsTwitarrTeam] = useState(false);
  const [asTHO, setAsTHO] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [asPrivileged, setAsPrivileged] = useState(false);
  const [asPrivilegedUser, setAsPrivilegedUser] = useState<keyof typeof PrivilegedUserAccounts>();

  useEffect(() => {
    setAsPrivileged(asModerator || asTwitarrTeam || asTHO || asAdmin);
    setAsPrivilegedUser(undefined);
    if (asAdmin) {
      setAsPrivilegedUser(PrivilegedUserAccounts.admin);
    }
    if (asTHO) {
      setAsPrivilegedUser(PrivilegedUserAccounts.tho);
    }
    if (asTwitarrTeam) {
      setAsPrivilegedUser(PrivilegedUserAccounts.twitarrteam);
    }
    if (asModerator) {
      setAsPrivilegedUser(PrivilegedUserAccounts.moderator);
    }
  }, [asModerator, asTwitarrTeam, asTHO, asAdmin, asPrivilegedUser, setAsPrivilegedUser]);

  const clearPrivileges = () => {
    console.info('Clearing Privileges');
    setAsModerator(false);
    setAsTwitarrTeam(false);
    setAsTHO(false);
    setAsAdmin(false);
  };

  const becomeUser = (user: keyof typeof PrivilegedUserAccounts) => {
    clearPrivileges();
    switch (user) {
      case PrivilegedUserAccounts.admin: {
        setAsAdmin(true);
        break;
      }
      case PrivilegedUserAccounts.tho: {
        setAsTHO(true);
        break;
      }
      case PrivilegedUserAccounts.twitarrteam: {
        setAsTwitarrTeam(true);
        break;
      }
      case PrivilegedUserAccounts.moderator: {
        setAsModerator(true);
        break;
      }
    }
  };
  //
  // const privilegedUser = () => {
  //   if (asAdmin) {
  //     return PrivilegedUserAccounts.admin;
  //   }
  //   if (asTHO) {
  //     return PrivilegedUserAccounts.tho;
  //   }
  //   if (asTwitarrTeam) {
  //     return PrivilegedUserAccounts.twitarrteam;
  //   }
  //   if (asModerator) {
  //     return PrivilegedUserAccounts.moderator;
  //   }
  // };

  return (
    <PrivilegeContext.Provider
      value={{
        asModerator,
        setAsModerator,
        asTwitarrTeam,
        setAsTwitarrTeam,
        asTHO,
        setAsTHO,
        asAdmin,
        setAsAdmin,
        asPrivileged,
        becomeUser,
        clearPrivileges,
        asPrivilegedUser,
      }}>
      {children}
    </PrivilegeContext.Provider>
  );
};
