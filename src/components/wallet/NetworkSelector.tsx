import React from 'react';
import { Select, Label } from '../ui';
import { useSolana } from '@/contexts/SolanaContext';
import { NetworkType } from '@/types';

export function NetworkSelector() {
  const { network, setNetwork } = useSolana();

  const networks: { value: NetworkType; label: string }[] = [
    { value: 'devnet', label: 'Devnet' },
    { value: 'testnet', label: 'Testnet' },
    { value: 'mainnet-beta', label: 'Mainnet' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="network" className="text-sm font-medium">
        Network:
      </Label>
      <Select
        id="network"
        value={network}
        onChange={(e) => setNetwork(e.target.value as NetworkType)}
        className="w-32"
      >
        {networks.map((net) => (
          <option key={net.value} value={net.value}>
            {net.label}
          </option>
        ))}
      </Select>
    </div>
  );
}