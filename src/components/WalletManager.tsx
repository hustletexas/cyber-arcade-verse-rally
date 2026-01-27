import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Copy, Eye, EyeOff, Trash2, Download, Upload, Plus, Lock, Unlock, AlertTriangle, Timer, Shield } from 'lucide-react';
import { encryptData, decryptData, isEncryptionSupported } from '@/utils/walletEncryption';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Auto-lock timeout in milliseconds (5 minutes)
const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000;
// Time to auto-clear private key from memory after display (30 seconds)
const PRIVATE_KEY_DISPLAY_TIMEOUT = 30 * 1000;

interface StoredWallet {
  publicKey: string;
  encryptedPrivateKey: string;
  isEncrypted: boolean;
}

interface DecryptedWallet extends StoredWallet {
  privateKey?: string;
  decryptedAt?: number; // Timestamp when decrypted for auto-lock
}

export const WalletManager = () => {
  const { toast } = useToast();
  const { connectWallet, getWalletIcon } = useMultiWallet();
  const [storedWallets, setStoredWallets] = useState<DecryptedWallet[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<{ [key: string]: boolean }>({});
  const [importPrivateKey, setImportPrivateKey] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  const [walletPassword, setWalletPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordAction, setPasswordAction] = useState<'create' | 'import' | 'decrypt' | 'export'>('create');
  const [pendingWalletData, setPendingWalletData] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [decryptingWallet, setDecryptingWallet] = useState<string | null>(null);
  const [sessionOnlyMode, setSessionOnlyMode] = useState(false);
  const [showSecurityAcknowledgment, setShowSecurityAcknowledgment] = useState(false);
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const privateKeyTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Clear decrypted private keys from memory (security measure)
  const clearDecryptedKeys = useCallback(() => {
    setStoredWallets(prev => prev.map(w => ({
      ...w,
      privateKey: undefined,
      decryptedAt: undefined
    })));
    setShowPrivateKeys({});
    // Clear any pending private key timers
    Object.values(privateKeyTimersRef.current).forEach(timer => clearTimeout(timer));
    privateKeyTimersRef.current = {};
  }, []);

  // Auto-lock on inactivity
  const resetAutoLockTimer = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }
    
    // Only set timer if there are decrypted wallets
    const hasDecryptedKeys = storedWallets.some(w => w.privateKey);
    if (hasDecryptedKeys) {
      autoLockTimerRef.current = setTimeout(() => {
        clearDecryptedKeys();
        toast({
          title: "🔒 Auto-locked",
          description: "Wallets locked due to inactivity for security",
        });
      }, AUTO_LOCK_TIMEOUT);
    }
  }, [storedWallets, clearDecryptedKeys, toast]);

  // Set up auto-lock timer and activity listeners
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetAutoLockTimer();
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    resetAutoLockTimer();
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
      }
    };
  }, [resetAutoLockTimer]);

  // Clear keys when component unmounts (security)
  useEffect(() => {
    return () => {
      clearDecryptedKeys();
    };
  }, [clearDecryptedKeys]);

  // Schedule auto-clear for displayed private key
  const schedulePrivateKeyClear = useCallback((publicKey: string) => {
    // Clear any existing timer for this wallet
    if (privateKeyTimersRef.current[publicKey]) {
      clearTimeout(privateKeyTimersRef.current[publicKey]);
    }
    
    // Set new timer to clear private key after timeout
    privateKeyTimersRef.current[publicKey] = setTimeout(() => {
      setStoredWallets(prev => prev.map(w => 
        w.publicKey === publicKey 
          ? { ...w, privateKey: undefined, decryptedAt: undefined }
          : w
      ));
      setShowPrivateKeys(prev => ({ ...prev, [publicKey]: false }));
      
      toast({
        title: "🔒 Key hidden",
        description: "Private key auto-hidden for security",
      });
      
      delete privateKeyTimersRef.current[publicKey];
    }, PRIVATE_KEY_DISPLAY_TIMEOUT);
  }, [toast]);

  useEffect(() => {
    loadStoredWallets();
  }, []);

  const loadStoredWallets = () => {
    try {
      const stored = localStorage.getItem('cyberCityWallet');
      if (stored) {
        const wallet = JSON.parse(stored);
        // Check if it's the old format (unencrypted)
        if (wallet.privateKey && !wallet.encryptedPrivateKey) {
          // Migrate to new format - mark as needing encryption
          setStoredWallets([{
            publicKey: wallet.publicKey,
            encryptedPrivateKey: wallet.privateKey,
            isEncrypted: false,
            privateKey: wallet.privateKey
          }]);
          toast({
            title: "⚠️ Security Update Required",
            description: "Your wallet needs encryption. Please set a password to secure it.",
            variant: "destructive",
          });
        } else if (wallet.encryptedPrivateKey) {
          setStoredWallets([{
            publicKey: wallet.publicKey,
            encryptedPrivateKey: wallet.encryptedPrivateKey,
            isEncrypted: wallet.isEncrypted ?? true
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  const requestPassword = (action: 'create' | 'import' | 'decrypt' | 'export', walletData?: { publicKey: string; privateKey: string }) => {
    setPasswordAction(action);
    setPendingWalletData(walletData || null);
    setWalletPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!isEncryptionSupported()) {
      toast({
        title: "Encryption Not Supported",
        description: "Your browser doesn't support secure encryption. Please use a modern browser.",
        variant: "destructive",
      });
      return;
    }

    if (passwordAction === 'create' || passwordAction === 'import') {
      // Strong password validation
      if (walletPassword.length < 12) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 12 characters for wallet security",
          variant: "destructive",
        });
        return;
      }
      
      const hasUppercase = /[A-Z]/.test(walletPassword);
      const hasLowercase = /[a-z]/.test(walletPassword);
      const hasNumber = /[0-9]/.test(walletPassword);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(walletPassword);
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        toast({
          title: "Password Requirements",
          description: "Password must include uppercase, lowercase, number, and special character",
          variant: "destructive",
        });
        return;
      }
      
      if (walletPassword !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (passwordAction === 'create' && pendingWalletData) {
        await saveEncryptedWallet(pendingWalletData.publicKey, pendingWalletData.privateKey, walletPassword);
      } else if (passwordAction === 'import' && pendingWalletData) {
        await saveEncryptedWallet(pendingWalletData.publicKey, pendingWalletData.privateKey, walletPassword);
      } else if (passwordAction === 'decrypt' && decryptingWallet) {
        await decryptWalletPrivateKey(decryptingWallet, walletPassword);
      } else if (passwordAction === 'export' && decryptingWallet) {
        await exportWalletWithPassword(decryptingWallet, walletPassword);
      }
      setShowPasswordDialog(false);
      setPendingWalletData(null);
      setDecryptingWallet(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  const saveEncryptedWallet = async (publicKey: string, privateKey: string, password: string) => {
    const encryptedPrivateKey = await encryptData(privateKey, password);
    
    const walletData = { 
      publicKey, 
      encryptedPrivateKey,
      isEncrypted: true
    };
    
    localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
    await connectWallet('created', publicKey);
    loadStoredWallets();
    
    toast({
      title: "Wallet Secured! 🔒",
      description: `Wallet encrypted and saved: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
    });
  };

  const decryptWalletPrivateKey = async (publicKey: string, password: string) => {
    const wallet = storedWallets.find(w => w.publicKey === publicKey);
    if (!wallet) return;

    const decryptedKey = await decryptData(wallet.encryptedPrivateKey, password);
    
    setStoredWallets(prev => prev.map(w => 
      w.publicKey === publicKey 
        ? { ...w, privateKey: decryptedKey, decryptedAt: Date.now() }
        : w
    ));
    
    // Schedule auto-clear of private key
    schedulePrivateKeyClear(publicKey);
    
    // Reset auto-lock timer
    resetAutoLockTimer();
    
    toast({
      title: "Wallet Unlocked! 🔓",
      description: "Private key decrypted. Will auto-hide in 30 seconds for security.",
    });
  };

  const handleCreateWallet = async () => {
    try {
      toast({
        title: "Creating Wallet...",
        description: "Generating a new secure Stellar wallet",
      });

      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      const privateKey = bs58.default.encode(newKeypair.secretKey);
      
      // Request password to encrypt
      requestPassword('create', { publicKey, privateKey });
      
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
      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const secretKey = bs58.default.decode(importPrivateKey.trim());
      const keypair = Keypair.fromSecretKey(secretKey);
      const publicKey = keypair.publicKey.toString();
      
      // Request password to encrypt
      requestPassword('import', { publicKey, privateKey: importPrivateKey.trim() });
      setImportPrivateKey('');
      setShowImportForm(false);
      
    } catch (error: any) {
      console.error('Wallet import error:', error);
      toast({
        title: "Import Failed",
        description: "Invalid private key format",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string, publicKey?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      
      // If copying a private key, clear it from memory immediately after copy
      if (label.toLowerCase().includes('private') && publicKey) {
        // Give user a moment to see the confirmation, then clear
        setTimeout(() => {
          setStoredWallets(prev => prev.map(w => 
            w.publicKey === publicKey 
              ? { ...w, privateKey: undefined, decryptedAt: undefined }
              : w
          ));
          setShowPrivateKeys(prev => ({ ...prev, [publicKey]: false }));
          
          // Clear the timer since we're clearing manually
          if (privateKeyTimersRef.current[publicKey]) {
            clearTimeout(privateKeyTimersRef.current[publicKey]);
            delete privateKeyTimersRef.current[publicKey];
          }
          
          toast({
            title: "🔒 Key secured",
            description: "Private key cleared from memory after copy",
          });
        }, 1500);
      }
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
    const wallet = storedWallets.find(w => w.publicKey === publicKey);
    
    if (wallet?.isEncrypted && !wallet.privateKey) {
      // Need to decrypt first
      setDecryptingWallet(publicKey);
      requestPassword('decrypt');
      return;
    }
    
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

  const exportWalletWithPassword = async (publicKey: string, password: string) => {
    const wallet = storedWallets.find(w => w.publicKey === publicKey);
    if (!wallet) return;

    let privateKey = wallet.privateKey;
    
    if (wallet.isEncrypted && !privateKey) {
      privateKey = await decryptData(wallet.encryptedPrivateKey, password);
    }
    
    const walletData = {
      publicKey: wallet.publicKey,
      privateKey,
      exportedAt: new Date().toISOString(),
      warning: "KEEP THIS FILE SECURE - Contains your private key!"
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
      description: "Wallet file downloaded successfully. Keep it secure!",
    });
  };

  const handleExportWallet = (wallet: DecryptedWallet) => {
    if (wallet.isEncrypted && !wallet.privateKey) {
      setDecryptingWallet(wallet.publicKey);
      requestPassword('export');
    } else if (wallet.privateKey) {
      const walletData = {
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        exportedAt: new Date().toISOString(),
        warning: "KEEP THIS FILE SECURE - Contains your private key!"
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Security Warning */}
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-2">
            <p className="font-semibold text-destructive">⚠️ Security Notice - Read Before Using</p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Browser storage has risks:</strong> XSS attacks, malicious extensions, or malware could potentially access keys</li>
              <li><strong>Encryption helps but isn't perfect:</strong> Keys are decrypted in memory when you view them</li>
              <li><strong>Best for small amounts only:</strong> Use hardware wallets for significant holdings</li>
              <li><strong>Auto-lock enabled:</strong> Keys auto-hide after 30 seconds and wallet locks after 5 minutes of inactivity</li>
              <li><strong>Backup required:</strong> Export and store your wallet file in a secure offline location</li>
            </ul>
            <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
              <Timer className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs">
                Private keys auto-clear from memory after 30 seconds for security
              </span>
            </div>
            <p className="text-neon-cyan font-medium mt-2">
              🔐 Recommended: Use Phantom, Solflare, or Ledger hardware wallet for better security
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
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
        {storedWallets.some(w => w.privateKey) && (
          <Button 
            onClick={clearDecryptedKeys}
            variant="outline"
            className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black flex items-center gap-2"
          >
            <Lock size={16} />
            Lock All Wallets
          </Button>
        )}
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
                    {wallet.isEncrypted ? (
                      <Badge className="bg-green-600 text-white flex items-center gap-1">
                        <Lock size={12} />
                        Encrypted
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 text-white flex items-center gap-1">
                        <Unlock size={12} />
                        Unencrypted
                      </Badge>
                    )}
                  </div>
                  
                  {/* Public Key */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Public Key:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-neon-cyan bg-background/50 px-2 py-1 rounded text-sm flex-1 break-all">
                        {wallet.publicKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(wallet.publicKey, 'Public key')}
                        className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black flex-shrink-0"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Private Key */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Private Key:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-neon-purple bg-background/50 px-2 py-1 rounded text-sm flex-1 break-all">
                        {showPrivateKeys[wallet.publicKey] && wallet.privateKey
                          ? wallet.privateKey 
                          : '•'.repeat(44)
                        }
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePrivateKeyVisibility(wallet.publicKey)}
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black flex-shrink-0"
                      >
                        {showPrivateKeys[wallet.publicKey] && wallet.privateKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      {wallet.privateKey && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(wallet.privateKey!, 'Private key', wallet.publicKey)}
                          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black flex-shrink-0"
                        >
                          <Copy size={14} />
                        </Button>
                      )}
                    </div>
                    {wallet.isEncrypted && !wallet.privateKey && (
                      <p className="text-xs text-muted-foreground mt-1">
                        🔒 Click the eye icon to unlock with your password
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleExportWallet(wallet)}
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

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {passwordAction === 'decrypt' || passwordAction === 'export' 
                ? 'Enter Wallet Password' 
                : 'Set Wallet Password'}
            </DialogTitle>
            <DialogDescription>
              {passwordAction === 'decrypt' || passwordAction === 'export'
                ? 'Enter your password to unlock the wallet'
                : 'Create a strong password to encrypt your wallet. You will need this password to access your private key.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Password"
              value={walletPassword}
              onChange={(e) => setWalletPassword(e.target.value)}
              className="bg-background border-neon-cyan"
            />
            {(passwordAction === 'create' || passwordAction === 'import') && (
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-neon-cyan"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                className="cyber-button"
              >
                {passwordAction === 'decrypt' || passwordAction === 'export' ? 'Unlock' : 'Encrypt & Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
