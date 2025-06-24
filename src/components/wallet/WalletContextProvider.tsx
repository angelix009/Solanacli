import React, { useMemo, ReactNode } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useSolana } from '../../contexts/SolanaContext';

require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextProviderProps {
  children: ReactNode;
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  const { network } = useSolana();

  const endpoint = useMemo(() => {
    switch (network) {
      case 'mainnet-beta':
        return clusterApiUrl(WalletAdapterNetwork.Mainnet);
      case 'testnet':
        return clusterApiUrl(WalletAdapterNetwork.Testnet);
      case 'devnet':
      default:
        return clusterApiUrl(WalletAdapterNetwork.Devnet);
    }
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}