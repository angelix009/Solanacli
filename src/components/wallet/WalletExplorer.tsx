import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../ui';
import { useSolana } from '../../contexts/SolanaContext';
import { formatAddress, formatBalance, validatePublicKey } from '../../utils';
import { WalletInfo } from '../../types';
import { Search, Wallet, Eye, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export function WalletExplorer() {
  const { service } = useSolana();
  const [walletAddress, setWalletAddress] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchWallet = async () => {
    if (!validatePublicKey(walletAddress)) {
      toast.error('Invalid wallet address');
      return;
    }

    setIsLoading(true);
    try {
      const address = new PublicKey(walletAddress);
      const info = await service.getWalletInfo(address);
      setWalletInfo(info);
      toast.success('Wallet information loaded');
    } catch (error) {
      toast.error('Failed to fetch wallet info');
      setWalletInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-6 w-6" />
            <span>Wallet Explorer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchWallet} disabled={isLoading}>
              {isLoading ? <LoadingSpinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {walletInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-6 w-6" />
                <span>Wallet Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Address:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(walletInfo.address.toString())}
                    className="h-auto p-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {walletInfo.address.toString()}
                </p>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">SOL Balance:</span>
                <p className="text-2xl font-bold text-primary">
                  {formatBalance(walletInfo.balance)} SOL
                </p>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Token Count:</span>
                <p className="text-lg font-semibold">
                  {walletInfo.tokens.length} tokens
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {walletInfo.tokens.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tokens found in this wallet
                </p>
              ) : (
                <div className="space-y-3">
                  {walletInfo.tokens.map((token, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatAddress(token.mint)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatBalance(token.balance, token.decimals)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {token.symbol}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}