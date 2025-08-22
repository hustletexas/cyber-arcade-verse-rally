
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Copy, Eye, EyeOff, Trash2, Download, Upload, Plus } from 'lucide-react';

interface StoredWallet {
  publicKey: string;
  privateKey: string;
  name?: string;
}

export const WalletManager = () => {
  const { toast } = useToast();
  const { connectWallet, getWalletIcon } = useMultiWallet();
  const [storedWallets, setStoredWallets] = useState<StoredWallet[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<{ [key: string]: boolean }>({});
  const [importPrivateKey, setImportPrivateKey] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);

  useEffect(() => {
    loadStoredWallets();
  }, []);

  const loadStoredWallets = () => {
    try {
      const stored = localStorage.getItem('cyberCityWallet');
      if (stored) {
        const wallet = JSON.parse(stored);
        setStoredWallets([wallet]);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  const handleCreateWallet = async () => {
    try {
      toast({
        title: "Creating Wallet...",
        description: "Generating a new secure Solana wallet",
      });

      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      const privateKey = bs58.default.encode(newKeypair.secretKey);
      
      const walletData = { publicKey, privateKey };
      
      // Save to localStorage (overwrite existing for now - could extend to support multiple)
      localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
      
      // Connect the wallet
      await connectWallet('created', publicKey);
      
      // Reload the stored wallets
      loadStoredWallets();
      
      toast({
        title: "Wallet Created! 🎉",
        description: `New wallet: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Wallet creation error:', error);
      toast({
        title: "Creation Failed",
        description: error?.message || "Failed to create wallet",
        variant: "destructive",
      });
    }
  };

  const handleImportWallet = async () => {
    if (!importPrivateKey.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a private key",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Importing Wallet...",
        description: "Importing your wallet from private key",
      });

      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const secretKey = bs58.default.decode(importPrivateKey.trim());
      
      const keypair = Keypair.fromSecretKey(secretKey);
      const publicKey = keypair.publicKey.toString();
      
      const walletData = { publicKey, privateKey: importPrivateKey.trim() };
      
      // Save to localStorage
      localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
      
      // Connect the wallet
      await connectWallet('created', publicKey);
      
      // Clear form and reload
      setImportPrivateKey('');
      setShowImportForm(false);
      loadStoredWallets();
      
      toast({
        title: "Wallet Imported! 🎉",
        description: `Imported wallet: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Wallet import error:', error);
      toast({
        title: "Import Failed",
        description: "Invalid private key format",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const togglePrivateKeyVisibility = (publicKey: string) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [publicKey]: !prev[publicKey]
    }));
  };

  const handleDeleteWallet = (publicKey: string) => {
    if (confirm('Are you sure you want to delete this wallet? This cannot be undone!')) {
      localStorage.removeItem('cyberCityWallet');
      setStoredWallets([]);
      toast({
        title: "Wallet Deleted",
        description: "Wallet has been permanently deleted",
      });
    }
  };

  const exportWallet = (wallet: StoredWallet) => {
    const walletData = {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-${wallet.publicKey.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Wallet Exported",
      description: "Wallet file downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleCreateWallet} className="cyber-button flex items-center gap-2">
          <Plus size={16} />
          Create New Wallet
        </Button>
        <Button 
          onClick={() => setShowImportForm(!showImportForm)}
          variant="outline"
          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black flex items-center gap-2"
        >
          <Upload size={16} />
          Import Wallet
        </Button>
      </div>

      {/* Import Form */}
      {showImportForm && (
        <Card className="holographic p-4">
          <h3 className="font-display text-lg text-neon-cyan mb-4">Import Wallet</h3>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter private key (Base58 format)"
              value={importPrivateKey}
              onChange={(e) => setImportPrivateKey(e.target.value)}
              className="bg-background/50 border-neon-purple"
            />
            <div className="flex gap-2">
              <Button onClick={handleImportWallet} className="cyber-button">
                Import
              </Button>
              <Button 
                onClick={() => {
                  setShowImportForm(false);
                  setImportPrivateKey('');
                }}
                variant="outline"
                className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stored Wallets */}
      <div className="space-y-4">
        <h3 className="font-display text-xl text-neon-green">Your Wallets</h3>
        
        {storedWallets.length === 0 ? (
          <Card className="vending-machine p-8 text-center">
            <p className="text-muted-foreground">No wallets found. Create or import a wallet to get started.</p>
          </Card>
        ) : (
          storedWallets.map((wallet) => (
            <Card key={wallet.publicKey} className="arcade-frame p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getWalletIcon('created')}</span>
                    <Badge className="bg-neon-green text-black">Created Wallet</Badge>
                  </div>
                  
                  {/* Public Key */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Public Key:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-neon-cyan bg-background/50 px-2 py-1 rounded text-sm flex-1">
                        {wallet.publicKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(wallet.publicKey, 'Public key')}
                        className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Private Key */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Private Key:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-neon-purple bg-background/50 px-2 py-1 rounded text-sm flex-1">
                        {showPrivateKeys[wallet.publicKey] 
                          ? wallet.privateKey 
                          : '•'.repeat(44)
                        }
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePrivateKeyVisibility(wallet.publicKey)}
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                      >
                        {showPrivateKeys[wallet.publicKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(wallet.privateKey, 'Private key')}
                        className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => exportWallet(wallet)}
                    className="cyber-button flex items-center gap-1"
                  >
                    <Download size={14} />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteWallet(wallet.publicKey)}
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
