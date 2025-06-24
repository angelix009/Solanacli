import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../ui';
import { useSolana } from '../../contexts/SolanaContext';
import { uploadToIPFS } from '../../utils';
import { Plus, Upload, Image as ImageIcon, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface TokenForm {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  supply: number;
  image: File | null;
  freezable: boolean;
  mintable: boolean;
}

export function TokenCreator() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { service } = useSolana();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [needsAirdrop, setNeedsAirdrop] = useState(false);

  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    description: '',
    decimals: 9,
    supply: 1000000,
    image: null,
    freezable: true,
    mintable: true,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const requestAirdrop = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setNeedsAirdrop(true);
    try {
      toast.loading('Requesting devnet SOL airdrop...');
      const signature = await service.requestAirdrop(publicKey, 2);
      toast.dismiss();
      toast.success(`Airdrop successful! Signature: ${signature.substring(0, 8)}...`);
      
      // Attendre un peu pour que le solde se mette à jour
      setTimeout(() => {
        setNeedsAirdrop(false);
      }, 3000);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to request airdrop. Try again in a few minutes.');
      setNeedsAirdrop(false);
    }
  };

  const checkBalance = async () => {
    if (!publicKey) return false;
    
    try {
      const balance = await service.getConnection().getBalance(publicKey);
      return balance > 1000000; // Au moins 0.001 SOL
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!form.name || !form.symbol) {
      toast.error('Name and symbol are required');
      return;
    }

    // Vérifier le solde
    const hasBalance = await checkBalance();
    if (!hasBalance) {
      toast.error('Insufficient SOL balance. Request an airdrop first.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Upload image to IPFS if provided
      let imageUrl = '';
      if (form.image) {
        toast.loading('Uploading image...');
        imageUrl = await uploadToIPFS(form.image);
        toast.dismiss();
        toast.success('Image uploaded successfully!');
      }

      const metadata = {
        name: form.name,
        symbol: form.symbol,
        description: form.description,
        image: imageUrl,
        decimals: form.decimals,
        supply: form.supply,
      };

      toast.loading('Creating token on Solana...');
      
      // Créer un objet wallet adapter compatible
      const walletAdapter = {
        publicKey,
        sendTransaction: async (transaction: any, connection: any) => {
          return await sendTransaction(transaction, connection);
        }
      };

      const result = await service.createToken(
        walletAdapter,
        metadata,
        form.freezable,
        form.mintable
      );

      toast.dismiss();
      toast.success(
        <div>
          <div className="font-bold">Token created successfully!</div>
          <div className="text-sm">Mint: {result.mint.toString().substring(0, 8)}...</div>
          <div className="text-sm">Signature: {result.signature.substring(0, 8)}...</div>
        </div>,
        { duration: 6000 }
      );

      // Reset form
      setForm({
        name: '',
        symbol: '',
        description: '',
        decimals: 9,
        supply: 1000000,
        image: null,
        freezable: true,
        mintable: true,
      });
      setImagePreview('');

      // Sauvegarder le token créé localement pour l'affichage
      const createdTokens = JSON.parse(localStorage.getItem('created_tokens') || '[]');
      createdTokens.push({
        mint: result.mint.toString(),
        metadata,
        signature: result.signature,
        timestamp: Date.now(),
      });
      localStorage.setItem('created_tokens', JSON.stringify(createdTokens));

    } catch (error: any) {
      toast.dismiss();
      console.error('Token creation error:', error);
      toast.error(`Failed to create token: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Airdrop Card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-400">
            <Zap className="h-6 w-6" />
            <span>Devnet SOL Airdrop</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Need SOL for transaction fees? Get free devnet SOL here.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connected: {publicKey ? `${publicKey.toString().substring(0, 8)}...` : 'Not connected'}
              </p>
            </div>
            <Button 
              onClick={requestAirdrop}
              disabled={!connected || needsAirdrop}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              {needsAirdrop ? (
                <LoadingSpinner className="h-4 w-4 mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Get 2 SOL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Creation Form */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-6 w-6" />
            <span>Create New SPL Token</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. My Awesome Token"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  placeholder="e.g. MAT"
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe your token..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Token Image</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {imagePreview && (
                  <div className="w-16 h-16 rounded-md border overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div className="w-16 h-16 rounded-md border border-dashed flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  min="0"
                  max="18"
                  value={form.decimals}
                  onChange={(e) => setForm({ ...form, decimals: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Standard is 9 decimals (like SOL)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply">Initial Supply</Label>
                <Input
                  id="supply"
                  type="number"
                  min="1"
                  value={form.supply}
                  onChange={(e) => setForm({ ...form, supply: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">
                  Number of tokens to mint initially
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="freezable"
                  checked={form.freezable}
                  onChange={(e) => setForm({ ...form, freezable: e.target.checked })}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                />
                <Label htmlFor="freezable" className="text-sm">
                  Enable Freeze Authority
                </Label>
                <span className="text-xs text-muted-foreground">
                  (Allows freezing token accounts)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mintable"
                  checked={form.mintable}
                  onChange={(e) => setForm({ ...form, mintable: e.target.checked })}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                />
                <Label htmlFor="mintable" className="text-sm">
                  Keep Mint Authority
                </Label>
                <span className="text-xs text-muted-foreground">
                  (Allows minting more tokens later)
                </span>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Transaction Fees</h4>
              <p className="text-sm text-muted-foreground">
                Creating a token requires approximately 0.002-0.003 SOL for transaction fees.
                Make sure you have sufficient SOL in your wallet.
              </p>
            </div>

            <Button type="submit" disabled={isLoading || !connected} className="w-full">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner className="h-4 w-4" />
                  <span>Creating Token...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Token on Solana</span>
                </div>
              )}
            </Button>

            {!connected && (
              <p className="text-center text-sm text-muted-foreground">
                Connect your wallet to create tokens
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}