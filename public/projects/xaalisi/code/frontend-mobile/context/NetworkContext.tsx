import React, { createContext, useContext } from 'react';

interface NetworkContextType {
  isOnline: boolean;
  isReconnecting: boolean;
  checkNow: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isReconnecting: false,
  checkNow: async () => true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  return (
    <NetworkContext.Provider value={{ isOnline: true, isReconnecting: false, checkNow: async () => true }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
