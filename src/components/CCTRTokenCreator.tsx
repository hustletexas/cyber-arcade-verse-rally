import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Coins, ExternalLink, Copy, Check, AlertTriangle } from 'lucide-react';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';

// SPL Token Program constants
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Mainnet RPC endpoint
const MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

export const CCTRTokenCreator = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState<TokenMetadata>({
    name: 'Cyber City Token',
    symbol: 'CCTR',
    decimals: 9,
    totalSupply: 1000000000, // 1 billion
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const createToken = async () => {
    try {
      setIsCreating(true);
      
      // Check if Phantom is installed
      const phantom = (window as any).phantom?.solana;
      if (!phantom?.isPhantom) {
        toast({
          title: "Wallet Required",
          description: "Please install Phantom wallet to create tokens",
          variant: "destructive",
        });
        return;
      }

      // Connect to wallet
      const response = await phantom.connect();
      const walletPublicKey = new PublicKey(response.publicKey.toString());
      
      toast({
        title: "Wallet Connected",
        description: `Connected: ${walletPublicKey.toString().slice(0, 8)}...`,
      });

      // Connect to Mainnet
      const connection = new Connection(MAINNET_RPC, 'confirmed');

      // Check wallet balance
      const balance = await connection.getBalance(walletPublicKey);
      const requiredBalance = 0.05 * 1e9; // ~0.05 SOL for token creation
      
      if (balance < requiredBalance) {
        toast({
          title: "Insufficient SOL",
          description: `You need at least 0.05 SOL. Current balance: ${(balance / 1e9).toFixed(4)} SOL`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Creating Token...",
        description: "Please approve the transaction in your wallet",
      });

      // Generate a new mint keypair
      const mintKeypair = Keypair.generate();
      
      // Calculate rent exemption for mint account
      const mintRent = await connection.getMinimumBalanceForRentExemption(82); // Mint account size

      // Create mint account instruction
      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: mintRent,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize mint instruction (manual encoding for SPL Token)
      const initializeMintIx = {
        keys: [
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.from([
          0, // InitializeMint instruction
          metadata.decimals, // decimals
          ...walletPublicKey.toBytes(), // mint authority
          1, // option: has freeze authority
          ...walletPublicKey.toBytes(), // freeze authority
        ]),
      };

      // Get associated token account address for the creator
      const [associatedTokenAddress] = PublicKey.findProgramAddressSync(
        [
          walletPublicKey.toBytes(),
          TOKEN_PROGRAM_ID.toBytes(),
          mintKeypair.publicKey.toBytes(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Create associated token account instruction
      const createAtaIx = {
        keys: [
          { pubkey: walletPublicKey, isSigner: true, isWritable: true },
          { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
          { pubkey: walletPublicKey, isSigner: false, isWritable: false },
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.alloc(0),
      };

      // Mint tokens instruction
      const mintAmount = BigInt(metadata.totalSupply) * BigInt(10 ** metadata.decimals);
      const mintToIx = {
        keys: [
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
          { pubkey: walletPublicKey, isSigner: true, isWritable: false },
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.from([
          7, // MintTo instruction
          ...new Uint8Array(new BigUint64Array([mintAmount]).buffer),
        ]),
      };

      // Build the transaction
      const transaction = new Transaction();
      transaction.add(createMintAccountIx);
      transaction.add(initializeMintIx);
      transaction.add(createAtaIx);
      transaction.add(mintToIx);

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;

      // Sign with mint keypair (partial sign)
      transaction.partialSign(mintKeypair);

      // Request signature from Phantom
      const signedTransaction = await phantom.signTransaction(transaction);

      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });

      // Wait for confirmation
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      }, 'confirmed');

      setMintAddress(mintKeypair.publicKey.toString());
      setTxSignature(signature);

      toast({
        title: "Token Created Successfully! 🎉",
        description: `CCTR token minted on Mainnet`,
      });

    } catch (error: any) {
      console.error('Token creation error:', error);
      toast({
        title: "Token Creation Failed",
        description: error.message || "An error occurred while creating the token",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="arcade-frame bg-background/80 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Coins className="h-6 w-6" />
          Create CCTR Token on Solana
        </CardTitle>
        <CardDescription>
          Deploy the official Cyber City Token (CCTR) to Solana Mainnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold">Mainnet Transaction</p>
            <p className="text-yellow-200/70 mt-1">
              This will create a real token on Solana Mainnet. You'll need approximately 0.05 SOL for transaction fees.
            </p>
          </div>
        </div>

        {/* Token Configuration */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={metadata.symbol}
              onChange={(e) => setMetadata({ ...metadata, symbol: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decimals">Decimals</Label>
            <Input
              id="decimals"
              type="number"
              value={metadata.decimals}
              onChange={(e) => setMetadata({ ...metadata, decimals: parseInt(e.target.value) || 9 })}
              className="bg-background/50"
              min={0}
              max={9}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supply">Total Supply</Label>
            <Input
              id="supply"
              type="number"
              value={metadata.totalSupply}
              onChange={(e) => setMetadata({ ...metadata, totalSupply: parseInt(e.target.value) || 0 })}
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Token Preview */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="font-semibold text-primary mb-2">Token Preview</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Name:</div>
            <div>{metadata.name}</div>
            <div className="text-muted-foreground">Symbol:</div>
            <div>{metadata.symbol}</div>
            <div className="text-muted-foreground">Decimals:</div>
            <div>{metadata.decimals}</div>
            <div className="text-muted-foreground">Total Supply:</div>
            <div>{metadata.totalSupply.toLocaleString()}</div>
            <div className="text-muted-foreground">Network:</div>
            <div className="text-green-400">Mainnet</div>
          </div>
        </div>

        {/* Success State */}
        {mintAddress && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 space-y-3">
            <h4 className="font-semibold text-green-400 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Token Created Successfully!
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-background/50">
                <span className="text-sm text-muted-foreground">Mint Address:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {mintAddress.slice(0, 8)}...{mintAddress.slice(-8)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(mintAddress)}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`https://solscan.io/token/${mintAddress}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Solscan
                </Button>
                {txSignature && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`https://solscan.io/tx/${txSignature}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Transaction
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={createToken}
          disabled={isCreating || !!mintAddress}
          className="w-full cyber-button"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Token...
            </>
          ) : mintAddress ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Token Created
            </>
          ) : (
            <>
              <Coins className="h-5 w-5 mr-2" />
              Create CCTR Token on Mainnet
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Make sure you have Phantom wallet installed and at least 0.05 SOL for fees
        </p>
      </CardContent>
    </Card>
  );
};

export default CCTRTokenCreator;
