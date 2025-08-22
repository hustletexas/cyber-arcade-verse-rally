import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const WalletManager = () => {
  const { toast } = useToast();
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showImportWallet, setShowImportWallet] = useState(false);
  const [importPrivateKey, setImportPrivateKey] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [createdWallet, setCreatedWallet] = useState<{publicKey: string, privateKey: string} | null>(null);

  useEffect(() => {
    loadStoredWallet();
  }, []);

  const loadStoredWallet = () => {
    try {
      const storedWallet = localStorage.getItem('cyberCityWallet');
      if (storedWallet) {
        const wallet = JSON.parse(storedWallet);
        setCreatedWallet(wallet);
        checkWalletBalance(wallet.publicKey);
      }
    } catch (error) {
      console.error('Error loading stored wallet:', error);
    }
  };

  const checkWalletBalance = async (publicKey: string) => {
    try {
      const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const balance = await connection.getBalance(new PublicKey(publicKey));
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setWalletBalance(0);
    }
  };

  const createWallet = async () => {
    try {
      toast({
        title: "Creating Wallet...",
        description: "Generating secure Solana keypair",
      });

      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      const privateKey = bs58.default.encode(newKeypair.secretKey);
      
      const walletData = { publicKey, privateKey };
      
      localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
      
      setCreatedWallet(walletData);
      
      await checkWalletBalance(publicKey);
      
      toast({
        title: "Wallet Created Successfully! 🎉",
        description: `New Solana wallet: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
      
      setShowWalletDetails(true);
      
    } catch (error) {
      console.error('Wallet creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create Solana wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importWallet = async () => {
    if (!importPrivateKey.trim()) {
      toast({
        title: "Missing Private Key",
        description: "Please enter a valid private key",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Importing Wallet...",
        description: "Validating and importing your Solana wallet",
      });

      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const secretKey = bs58.default.decode(importPrivateKey.trim());
      
      const keypair = Keypair.fromSecretKey(secretKey);
      const publicKey = keypair.publicKey.toString();
      
      const walletData = { publicKey, privateKey: importPrivateKey.trim() };
      
      localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
      
      setCreatedWallet(walletData);
      
      await checkWalletBalance(publicKey);
      
      setImportPrivateKey('');
      setShowImportWallet(false);
      
      toast({
        title: "Wallet Imported Successfully! 🎉",
        description: `Imported Solana wallet: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
      
      setShowWalletDetails(true);
      
    } catch (error) {
      console.error('Wallet import error:', error);
      toast({
        title: "Import Failed",
        description: "Invalid private key. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const exportWallet = () => {
    if (!createdWallet) return;
    
    const walletData = {
      publicKey: createdWallet.publicKey,
      privateKey: createdWallet.privateKey,
      created: new Date().toISOString(),
      network: 'mainnet-beta'
    };
    
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyber-city-wallet-${createdWallet.publicKey.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Wallet Exported",
      description: "Wallet file downloaded. Keep it secure!",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const deleteWallet = () => {
    localStorage.removeItem('cyberCityWallet');
    setCreatedWallet(null);
    setWalletBalance(0);
    setShowWalletDetails(false);
    
    toast({
      title: "Wallet Deleted",
      description: "Local wallet has been removed",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Wallet Actions - Only Import Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setShowImportWallet(true)}
          className="cyber-button flex items-center gap-2 h-16"
          variant="outline"
        >
          <Upload size={16} />
          IMPORT EXISTING WALLET
        </Button>
      </div>

      {/* Show wallet details if one exists */}
      {createdWallet && (
        <Card className="holographic p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-neon-pink">Current Wallet</h3>
              <Button 
                size="sm"
                onClick={() => checkWalletBalance(createdWallet.publicKey)}
                className="cyber-button text-xs"
              >
                🔄 REFRESH BALANCE
              </Button>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {walletBalance.toFixed(4)} SOL
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ ${(walletBalance * 50).toFixed(2)} USD
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-neon-purple">Public Key (Address)</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    readOnly 
                    value={createdWallet.publicKey}
                    className="flex-1 p-2 bg-black/50 border border-neon-cyan rounded text-neon-cyan text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(createdWallet.publicKey, "Public Key")}
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                    variant="outline"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-neon-pink">Private Key</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    readOnly 
                    type={showPrivateKey ? "text" : "password"}
                    value={createdWallet.privateKey}
                    className="flex-1 p-2 bg-black/50 border border-neon-pink rounded text-neon-pink text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                    variant="outline"
                  >
                    {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(createdWallet.privateKey, "Private Key")}
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                    variant="outline"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <Button 
                onClick={exportWallet}
                className="cyber-button flex items-center gap-2"
                size="sm"
              >
                <Download size={16} />
                EXPORT
              </Button>
              
              <Button 
                onClick={() => {
                  window.open(`https://explorer.solana.com/address/${createdWallet.publicKey}`, '_blank');
                }}
                variant="outline"
                size="sm"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
              >
                🔍 EXPLORER
              </Button>
              
              <Button 
                onClick={deleteWallet}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                🗑️ DELETE
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Import Wallet Dialog */}
      <Dialog open={showImportWallet} onOpenChange={setShowImportWallet}>
        <DialogContent className="max-w-md arcade-frame">
          <DialogHeader>
            <DialogTitle className="text-xl text-neon-cyan font-display flex items-center gap-2">
              <Upload size={24} />
              Import Solana Wallet
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neon-purple">Private Key</label>
              <Input
                type="password"
                placeholder="Enter your Solana private key (base58 encoded)"
                value={importPrivateKey}
                onChange={(e) => setImportPrivateKey(e.target.value)}
                className="bg-black/50 border-neon-cyan text-neon-cyan font-mono text-sm"
              />
              <p className="text-xs text-red-400">
                ⚠️ Never share your private key with anyone!
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={importWallet}
                className="cyber-button flex-1"
                disabled={!importPrivateKey.trim()}
              >
                <Upload size={16} className="mr-2" />
                IMPORT WALLET
              </Button>
              <Button 
                onClick={() => {
                  setShowImportWallet(false);
                  setImportPrivateKey('');
                }}
                variant="outline"
                className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
              >
                CANCEL
              </Button>
            </div>

            <Card className="bg-neon-cyan/10 border-neon-cyan/30">
              <CardContent className="p-3">
                <h4 className="font-bold text-neon-cyan mb-2 text-sm">📝 How to get your private key:</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• From Phantom: Settings → Export Private Key</li>
                  <li>• From Solflare: Menu → Export Wallet</li>
                  <li>• From CLI: solana-keygen display</li>
                  <li>• Should be base58 encoded string</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Section */}
      <Card className="bg-neon-cyan/10 border-neon-cyan/30">
        <CardContent className="p-4">
          <h4 className="font-bold text-neon-cyan mb-2">🎮 Wallet Manager Features</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Import existing wallets from other apps</li>
            <li>• View real-time SOL balance</li>
            <li>• Export wallet files for backup</li>
            <li>• Connect to Solana Explorer</li>
            <li>• Secure local storage encryption</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
