import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../ui';
import { useSolana } from '../../contexts/SolanaContext';
import { formatAddress, formatBalance, validatePublicKey } from '../../utils';
import { TokenInfo } from '../../types';
import { Search, Snowflake, Sun, Coins, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function TokenManager() {
  const { publicKey } = useWallet();
  const { service } = useSolana();
  const [mintAddress, setMintAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetWallet, setTargetWallet] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const searchToken = async () => {
    if (!validatePublicKey(mintAddress)) {
      toast.error('Invalid mint address');
      return;
    }

    setIsLoading(true);
    try {
      const mint = new PublicKey(mintAddress);
      const info = await service.getTokenInfo(mint);
      
      if (info) {
        setTokenInfo(info);
        toast.success('Token found!');
      } else {
        toast.error('Token not found');
        setTokenInfo(null);
      }
    } catch (error) {
      toast.error('Failed to fetch token info');
      setTokenInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeze = async () => {
    if (!publicKey || !tokenInfo || !validatePublicKey(targetWallet)) {
      toast.error('Invalid parameters');
      return;
    }

    setActionLoading('freeze');
    try {
      // Simulation - en production, utilisez la vraie signature
      const payer = { publicKey } as any;
      await service.freezeAccount(payer, tokenInfo.mint, new PublicKey(targetWallet));
      toast.success('Account frozen successfully');
    } catch (error) {
      toast.error('Failed to freeze account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleThaw = async () => {
    if (!publicKey || !tokenInfo || !validatePublicKey(targetWallet)) {
      toast.error('Invalid parameters');
      return;
    }

    setActionLoading('thaw');
    try {
      // Simulation - en production, utilisez la vraie signature
      const payer = { publicKey } as any;
      await service.thawAccount(payer, tokenInfo.mint, new PublicKey(targetWallet));
      toast.success('Account thawed successfully');
    } catch (error) {
      toast.error('Failed to thaw account');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-6 w-6" />
            <span>Token Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter token mint address"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchToken} disabled={isLoading}>
              {isLoading ? <LoadingSpinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {tokenInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="h-6 w-6" />
                <span>Token Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Name:</span>
                  <p className="font-semibold">{tokenInfo.metadata.name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Symbol:</span>
                  <p className="font-semibold">{tokenInfo.metadata.symbol}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Decimals:</span>
                  <p className="font-semibold">{tokenInfo.metadata.decimals}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Total Supply:</span>
                  <p className="font-semibold">
                    {formatBalance(tokenInfo.totalSupply, tokenInfo.metadata.decimals)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Mintable:</span>
                  <p className={`font-semibold ${tokenInfo.isMintable ? 'text-green-500' : 'text-red-500'}`}>
                    {tokenInfo.isMintable ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Freezable:</span>
                  <p className={`font-semibold ${tokenInfo.isFreezable ? 'text-green-500' : 'text-red-500'}`}>
                    {tokenInfo.isFreezable ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Mint Address:</span>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {tokenInfo.mint.toString()}
                </p>
              </div>

              {tokenInfo.metadata.description && (
                <div>
                  <span className="font-medium text-muted-foreground">Description:</span>
                  <p className="text-sm mt-1">{tokenInfo.metadata.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {tokenInfo.isFreezable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Snowflake className="h-6 w-6" />
                  <span>Account Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWallet">Target Wallet Address</Label>
                  <Input
                    id="targetWallet"
                    placeholder="Enter wallet address to freeze/thaw"
                    value={targetWallet}
                    onChange={(e) => setTargetWallet(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleFreeze}
                    disabled={!publicKey || !validatePublicKey(targetWallet) || actionLoading === 'freeze'}
                    className="flex-1"
                  >
                    {actionLoading === 'freeze' ? (
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Snowflake className="h-4 w-4 mr-2" />
                    )}
                    Freeze Account
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleThaw}
                    disabled={!publicKey || !validatePublicKey(targetWallet) || actionLoading === 'thaw'}
                    className="flex-1"
                  >
                    {actionLoading === 'thaw' ? (
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Sun className="h-4 w-4 mr-2" />
                    )}
                    Thaw Account
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Only the freeze authority can freeze/thaw token accounts
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}