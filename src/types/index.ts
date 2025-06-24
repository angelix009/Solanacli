import { PublicKey } from '@solana/web3.js';

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

export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta';