import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createFreezeAccountInstruction,
  createThawAccountInstruction,
  getAssociatedTokenAddress,
  getMint,
  getAccount,
  TokenError,
} from '@solana/spl-token';
import { TokenInfo, TokenMetadata, TokenHolder, WalletInfo, NetworkType } from '../types';

export class SolanaService {
  private connection: Connection;
  private network: NetworkType;

  constructor(network: NetworkType = 'devnet') {
    this.network = network;
    this.connection = new Connection(this.getClusterUrl(network), 'confirmed');
  }

  private getClusterUrl(network: NetworkType): string {
    switch (network) {
      case 'mainnet-beta':
        return 'https://api.mainnet-beta.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      case 'devnet':
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  async createToken(
    payer: Keypair,
    metadata: TokenMetadata,
    freezable: boolean = true,
    mintable: boolean = true
  ): Promise<{ mint: PublicKey; signature: string }> {
    try {
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(82);

      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: rentExemption,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

      const initializeMintInstruction = createInitializeMintInstruction(
        mint,
        metadata.decimals,
        mintable ? payer.publicKey : null,
        freezable ? payer.publicKey : null,
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMintInstruction
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [payer, mintKeypair]
      );

      return { mint, signature };
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error('Failed to create token');
    }
  }

  async mintTokens(
    payer: Keypair,
    mint: PublicKey,
    destination: PublicKey,
    amount: number,
    decimals: number
  ): Promise<string> {
    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint,
        destination,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      let transaction = new Transaction();

      try {
        await getAccount(this.connection, associatedTokenAccount);
      } catch (error) {
        if (error instanceof TokenError) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              payer.publicKey,
              associatedTokenAccount,
              destination,
              mint,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }
      }

      transaction.add(
        createMintToInstruction(
          mint,
          associatedTokenAccount,
          payer.publicKey,
          amount * Math.pow(10, decimals),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      return await sendAndConfirmTransaction(this.connection, transaction, [payer]);
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error('Failed to mint tokens');
    }
  }

  async freezeAccount(
    payer: Keypair,
    mint: PublicKey,
    account: PublicKey
  ): Promise<string> {
    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint,
        account,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        createFreezeAccountInstruction(
          associatedTokenAccount,
          mint,
          payer.publicKey,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      return await sendAndConfirmTransaction(this.connection, transaction, [payer]);
    } catch (error) {
      console.error('Error freezing account:', error);
      throw new Error('Failed to freeze account');
    }
  }

  async thawAccount(
    payer: Keypair,
    mint: PublicKey,
    account: PublicKey
  ): Promise<string> {
    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint,
        account,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        createThawAccountInstruction(
          associatedTokenAccount,
          mint,
          payer.publicKey,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      return await sendAndConfirmTransaction(this.connection, transaction, [payer]);
    } catch (error) {
      console.error('Error thawing account:', error);
      throw new Error('Failed to thaw account');
    }
  }

  async getTokenInfo(mint: PublicKey): Promise<TokenInfo | null> {
    try {
      const mintInfo = await getMint(this.connection, mint);
      const supply = await getTokenSupply(this.connection, mint);

      // Mock metadata - dans un vrai projet, récupérez depuis Metaplex
      const metadata: TokenMetadata = {
        name: 'Custom Token',
        symbol: 'CUSTOM',
        description: 'A custom token created with Solana Dashboard',
        image: '',
        decimals: mintInfo.decimals,
        supply: parseInt(supply.value.amount),
        freezeAuthority: mintInfo.freezeAuthority,
        mintAuthority: mintInfo.mintAuthority,
      };

      return {
        mint,
        metadata,
        isFrozen: false,
        isMintable: mintInfo.mintAuthority !== null,
        isFreezable: mintInfo.freezeAuthority !== null,
        holders: [],
        totalSupply: parseInt(supply.value.amount),
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  async getWalletInfo(address: PublicKey): Promise<WalletInfo> {
    try {
      const balance = await this.connection.getBalance(address);

      // Dans un vrai projet, récupérez tous les tokens du wallet
      const tokens = [];

      return {
        address,
        balance,
        tokens,
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw new Error('Failed to get wallet info');
    }
  }

  async getTokenHolders(mint: PublicKey): Promise<TokenHolder[]> {
    try {
      // Mock implementation - dans un vrai projet, utilisez getProgramAccounts
      return [];
    } catch (error) {
      console.error('Error getting token holders:', error);
      return [];
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  getNetwork(): NetworkType {
    return this.network;
  }
}