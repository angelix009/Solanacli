import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PublicKey } from '@solana/web3.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: PublicKey | string): string {
  const addr = typeof address === 'string' ? address : address.toString();
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function formatBalance(balance: number, decimals: number = 9): string {
  return (balance / Math.pow(10, decimals)).toFixed(4);
}

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
}

export function validatePublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function uploadToIPFS(file: File): Promise<string> {
  // Simulation d'upload IPFS - remplacez par votre service réel
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockHash = `QmX${Math.random().toString(36).substring(2, 15)}`;
      resolve(`https://ipfs.io/ipfs/${mockHash}`);
    }, 1000);
  });
}