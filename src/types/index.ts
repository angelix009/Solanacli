import { PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  decimals: number;
  supply: number;
  freezeAuthority?: PublicKey | null;
  mintAuthority?: PublicKey | null;
}

export interface TokenInfo {
  mint: PublicKey;
  metadata: TokenMetadata;
  isFrozen: boolean;
  isMintable: boolean;
  isFreezable: boolean;
  holders: TokenHolder[];
  totalSupply: number;
}

export interface TokenHolder {
  address: PublicKey;
  balance: number;
  isFrozen: boolean;
}

export interface WalletInfo {
  address: PublicKey;
  balance: number;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  mint: PublicKey;
  balance: number;
  decimals: number;
  symbol: string;
}

// Utiliser directement le type de wallet-adapter pour éviter les conflits
export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta';

// Fonction utilitaire pour convertir NetworkType vers WalletAdapterNetwork
export function networkTypeToWalletAdapterNetwork(network: NetworkType): WalletAdapterNetwork {
  switch (network) {
    case 'mainnet-beta':
      return WalletAdapterNetwork.Mainnet;
    case 'testnet':
      return WalletAdapterNetwork.Testnet;
    case 'devnet':
    default:
      return WalletAdapterNetwork.Devnet;
  }
}