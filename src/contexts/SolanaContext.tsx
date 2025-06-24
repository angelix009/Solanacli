import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SolanaService } from '../services/solana';
import { NetworkType } from '../types';

interface SolanaContextType {
  service: SolanaService;
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  isLoading: boolean;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

interface SolanaProviderProps {
  children: ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const [network, setNetwork] = useState<NetworkType>('devnet');
  const [service, setService] = useState(() => new SolanaService(network));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const newService = new SolanaService(network);
    setService(newService);
    setIsLoading(false);
  }, [network]);

  const value: SolanaContextType = {
    service,
    network,
    setNetwork,
    isLoading,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
}

export function useSolana() {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}