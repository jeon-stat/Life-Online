import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { createLocalAccount, loadAuthState, loginWithHandle, logoutLocalAccount, saveAuthState } from "./authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ accounts: [], sessionId: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadAuthState()
      .then((nextState) => {
        if (cancelled) {
          return;
        }

        setAuthState(nextState);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const currentUser = authState.accounts.find((account) => account.id === authState.sessionId) ?? null;

    return {
      currentUser,
      accounts: authState.accounts,
      isAuthenticated: Boolean(currentUser),
      isReady,
      signUp: ({ handle, nickname }) => {
        const next = createLocalAccount(authState, { handle, nickname });
        setAuthState(next);
        void saveAuthState(next);
      },
      signIn: (handle) => {
        const next = loginWithHandle(authState, handle);
        setAuthState(next);
        void saveAuthState(next);
      },
      signOut: () => {
        const next = logoutLocalAccount(authState);
        setAuthState(next);
        void saveAuthState(next);
      },
    };
  }, [authState, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
