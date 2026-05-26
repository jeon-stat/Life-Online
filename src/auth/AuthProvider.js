import { createContext, useContext, useMemo, useState } from "react";

import { createLocalAccount, loadAuthState, loginWithHandle, logoutLocalAccount } from "./authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => loadAuthState());

  const value = useMemo(() => {
    const currentUser = authState.accounts.find((account) => account.id === authState.sessionId) ?? null;

    return {
      currentUser,
      accounts: authState.accounts,
      isAuthenticated: Boolean(currentUser),
      signUp: ({ handle, nickname }) => {
        const next = createLocalAccount({ handle, nickname });
        setAuthState(next);
      },
      signIn: (handle) => {
        const next = loginWithHandle(handle);
        setAuthState(next);
      },
      signOut: () => {
        const next = logoutLocalAccount();
        setAuthState(next);
      },
    };
  }, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
