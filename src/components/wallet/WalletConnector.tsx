import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '../ui';
import { Wallet, LogOut } from 'lucide-react';
import { formatAddress } from '@/utils';

export function WalletConnector() {
  const { connected, publicKey, disconnect } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center space-x-4">
        <WalletMultiButton className="!bg-primary !rounded-md !text-primary-foreground hover:!bg-primary/90 !px-4 !py-2 !text-sm !font-medium !transition-colors" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 bg-muted rounded-md px-3 py-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {publicKey ? formatAddress(publicKey) : 'Connected'}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={disconnect}
        className="flex items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Disconnect</span>
      </Button>
    </div>
  );
}