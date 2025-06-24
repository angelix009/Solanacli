import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  clusterApiUrl,
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
  createSetAuthorityInstruction,
  AuthorityType,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { TokenInfo, TokenMetadata, TokenHolder, WalletInfo, NetworkType, networkTypeToWalletAdapterNetwork } from '../types';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class SolanaService {
  private connection: Connection;
  private network: NetworkType;

  constructor(network: NetworkType = 'devnet') {
    this.network = network;
    this.connection = new Connection(this.getClusterUrl(network), 'confirmed');
  }

  private getClusterUrl(network: NetworkType): string {
    const walletNetwork = networkTypeToWalletAdapterNetwork(network);
    return clusterApiUrl(walletNetwork);
  }

  async createToken(
    payer: any, // Wallet adapter
    metadata: TokenMetadata,
    freezable: boolean = true,
    mintable: boolean = true
  ): Promise<{ mint: PublicKey; signature: string }> {
    try {
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      console.log('Creating token with mint:', mint.toString());
      console.log('Payer:', payer.publicKey.toString());

      // Calculer la taille et le coût du mint account
      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(82);

      // Créer l'instruction pour créer le compte mint
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: rentExemption,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

      // Créer l'instruction pour initialiser le mint
      const initializeMintInstruction = createInitializeMintInstruction(
        mint,
        metadata.decimals,
        payer.publicKey, // Mint authority
        freezable ? payer.publicKey : null // Freeze authority
      );

      // Créer la transaction
      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMintInstruction
      );

      // Obtenir le blockhash récent
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;

      // Signer avec le mint keypair
      transaction.partialSign(mintKeypair);

      // Envoyer et signer avec le wallet
      const signature = await payer.sendTransaction(transaction, this.connection);
      
      // Confirmer la transaction
      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('Token created with signature:', signature);

      // Créer le compte de token associé pour le créateur
      const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        mintKeypair, // Utilise une keypair temporaire
        mint,
        payer.publicKey,
        false,
        'confirmed',
        {},
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Mint les tokens initiaux
      if (metadata.supply > 0) {
        const mintTransaction = new Transaction().add(
          createMintToInstruction(
            mint,
            associatedTokenAccount.address,
            payer.publicKey,
            metadata.supply * Math.pow(10, metadata.decimals),
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const mintSignature = await payer.sendTransaction(mintTransaction, this.connection);
        await this.connection.confirmTransaction(mintSignature, 'confirmed');
        console.log('Minted tokens with signature:', mintSignature);
      }

      // Désactiver l'autorité de mint si demandé
      if (!mintable) {
        const disableMintTransaction = new Transaction().add(
          createSetAuthorityInstruction(
            mint,
            payer.publicKey,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const disableSignature = await payer.sendTransaction(disableMintTransaction, this.connection);
        await this.connection.confirmTransaction(disableSignature, 'confirmed');
        console.log('Disabled mint authority with signature:', disableSignature);
      }

      return { mint, signature };
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error(`Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async freezeAccount(
    payer: any,
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

      const signature = await payer.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Error freezing account:', error);
      throw new Error(`Failed to freeze account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async thawAccount(
    payer: any,
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

      const signature = await payer.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Error thawing account:', error);
      throw new Error(`Failed to thaw account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTokenInfo(mint: PublicKey): Promise<TokenInfo | null> {
    try {
      const mintInfo = await getMint(this.connection, mint);

      // Métadonnées basiques (dans un vrai projet, utilisez Metaplex)
      const metadata: TokenMetadata = {
        name: 'Custom Token',
        symbol: 'CUSTOM',
        description: 'A custom token created with Solana Dashboard',
        image: '',
        decimals: mintInfo.decimals,
        supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
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
        totalSupply: Number(mintInfo.supply),
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  async getWalletInfo(address: PublicKey): Promise<WalletInfo> {
    try {
      const balance = await this.connection.getBalance(address);

      // Obtenir les comptes de tokens de ce wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        address,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      const tokens = tokenAccounts.value.map(account => {
        const parsedInfo = account.account.data.parsed.info;
        return {
          mint: new PublicKey(parsedInfo.mint),
          balance: parseInt(parsedInfo.tokenAmount.amount),
          decimals: parsedInfo.tokenAmount.decimals,
          symbol: 'UNKNOWN', // Dans un vrai projet, récupérez depuis les métadonnées
        };
      }).filter(token => token.balance > 0);

      return {
        address,
        balance,
        tokens,
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw new Error(`Failed to get wallet info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTokenHolders(mint: PublicKey): Promise<TokenHolder[]> {
    try {
      const accounts = await this.connection.getProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
          filters: [
            {
              dataSize: 165, // Taille d'un compte de token
            },
            {
              memcmp: {
                offset: 0,
                bytes: mint.toBase58(),
              },
            },
          ],
        }
      );

      const holders: TokenHolder[] = [];
      
      for (const account of accounts) {
        try {
          const tokenAccount = await getAccount(this.connection, account.pubkey);
          if (Number(tokenAccount.amount) > 0) {
            holders.push({
              address: tokenAccount.owner,
              balance: Number(tokenAccount.amount),
              isFrozen: tokenAccount.isFrozen,
            });
          }
        } catch (error) {
          // Ignorer les comptes invalides
          continue;
        }
      }

      return holders;
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

  // Méthode utilitaire pour obtenir des SOL de test sur devnet
  async requestAirdrop(publicKey: PublicKey, amount: number = 1): Promise<string> {
    if (this.network !== 'devnet') {
      throw new Error('Airdrop only available on devnet');
    }

    try {
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await this.connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw new Error('Failed to request airdrop');
    }
  }
}