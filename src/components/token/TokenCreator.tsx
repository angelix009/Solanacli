import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../ui';
import { useSolana } from '@/contexts/SolanaContext';
import { uploadToIPFS } from '@/utils';
import { Plus, Upload, Image as ImageIcon } from 'lucide-react';
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
  const { publicKey } = useWallet();
  const { service } = useSolana();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!form.name || !form.symbol) {
      toast.error('Name and symbol are required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Upload image to IPFS
      let imageUrl = '';
      if (form.image) {
        toast.loading('Uploading image...');
        imageUrl = await uploadToIPFS(form.image);
        toast.dismiss();
      }

      // Create keypair from wallet (simulation)
      const payer = Keypair.generate(); // En production, utilisez la vraie signature du wallet
      
      const metadata = {
        name: form.name,
        symbol: form.symbol,
        description: form.description,
        image: imageUrl,
        decimals: form.decimals,
        supply: form.supply,
      };

      toast.loading('Creating token...');
      const result = await service.createToken(
        payer,
        metadata,
        form.freezable,
        form.mintable
      );

      toast.dismiss();
      toast.success(`Token created successfully! Mint: ${result.mint.toString()}`);

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

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to create token');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-6 w-6" />
          <span>Create New Token</span>
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
                onChange={(e) => setForm({ ...form, decimals: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supply">Initial Supply</Label>
              <Input
                id="supply"
                type="number"
                min="1"
                value={form.supply}
                onChange={(e) => setForm({ ...form, supply: parseInt(e.target.value) })}
              />
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
              <Label htmlFor="freezable">Enable Freeze Authority</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mintable"
                checked={form.mintable}
                onChange={(e) => setForm({ ...form, mintable: e.target.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
              <Label htmlFor="mintable">Enable Mint Authority</Label>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !publicKey} className="w-full">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner className="h-4 w-4" />
                <span>Creating Token...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Token</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}