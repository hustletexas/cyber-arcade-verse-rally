import { describe, it, expect, vi, beforeEach } from 'vitest';
// @ts-ignore
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletConnectionModal } from './WalletConnectionModal';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useTieredAuth: () => ({
    signInWithMagicLink: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/utils/mobileWalletDetection', () => ({
  isMobileDevice: () => false,
  detectMobileWallets: vi.fn().mockResolvedValue([]),
  getStoreLink: vi.fn(),
  generateSignatureNonce: () => 'test-nonce',
  buildSignatureMessage: () => 'test-message',
}));

vi.mock('@creit.tech/stellar-wallets-kit', () => {
  const mockModule = {
    productId: 'mock',
    isAvailable: vi.fn().mockResolvedValue(true),
    getAddress: vi.fn().mockResolvedValue({ address: 'GTEST1234' }),
  };
  return {
    StellarWalletsKit: vi.fn().mockImplementation(() => ({
      setWallet: vi.fn(),
      getAddress: vi.fn().mockResolvedValue({ address: 'GTEST1234' }),
      openModal: vi.fn(),
    })),
    WalletNetwork: { PUBLIC: 'PUBLIC', TESTNET: 'TESTNET' },
    allowAllModules: () => [
      { ...mockModule, productId: 'lobstr' },
      { ...mockModule, productId: 'freighter' },
      { ...mockModule, productId: 'albedo' },
      { ...mockModule, productId: 'xbull' },
      { ...mockModule, productId: 'hot-wallet' },
    ],
    LOBSTR_ID: 'lobstr',
    XBULL_ID: 'xbull',
    FREIGHTER_ID: 'freighter',
    ALBEDO_ID: 'albedo',
    HOTWALLET_ID: 'hot-wallet',
  };
});

vi.mock('@creit.tech/stellar-wallets-kit/modules/walletconnect.module', () => ({
  WALLET_CONNECT_ID: 'wallet-connect',
  WalletConnectModule: vi.fn(),
  WalletConnectAllowedMethods: { SIGN: 'SIGN' },
}));

vi.mock('@stellar/freighter-api', () => ({
  default: {
    isConnected: vi.fn().mockResolvedValue(true),
    requestAccess: vi.fn().mockResolvedValue({ error: null }),
    getAddress: vi.fn().mockResolvedValue({ address: 'GTEST1234', error: null }),
  },
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onWalletConnected: vi.fn(),
};

const renderModal = (props = {}) =>
  render(
    <BrowserRouter>
      <WalletConnectionModal {...defaultProps} {...props} />
    </BrowserRouter>
  );

describe('WalletConnectionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when open', () => {
    renderModal();
    expect(screen.getByText('Connect Stellar Wallet')).toBeInTheDocument();
  });

  it('renders Quick Start section with Guest and Magic Link', () => {
    renderModal();
    expect(screen.getByText('Play as Guest')).toBeInTheDocument();
    expect(screen.getByText('Magic Link')).toBeInTheDocument();
  });

  it('renders all 3 wallet buttons', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('LOBSTR')).toBeInTheDocument();
      expect(screen.getByText('Freighter')).toBeInTheDocument();
      expect(screen.getByText('Hot Wallet')).toBeInTheDocument();
    });
  });

  it('shows Quick Start options above wallets', () => {
    renderModal();
    const guestBtn = screen.getByText('Play as Guest');
    const lobstrBtn = screen.getByText('LOBSTR');
    
    // Guest should come before LOBSTR in the DOM
    const allButtons = screen.getAllByRole('button');
    const guestIndex = allButtons.findIndex(btn => btn.contains(guestBtn));
    const lobstrIndex = allButtons.findIndex(btn => btn.contains(lobstrBtn));
    expect(guestIndex).toBeLessThan(lobstrIndex);
  });

  it('shows LOBSTR with Recommended badge', () => {
    renderModal();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('switches to magic link form when Magic Link is clicked', async () => {
    renderModal();
    fireEvent.click(screen.getByTestId('magic-link-btn'));
    expect(screen.getByText('Sign In with Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('calls onClose when guest login is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('guest-login-btn'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Connect Stellar Wallet')).not.toBeInTheDocument();
  });

  it('shows back button in magic link mode', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('magic-link-btn'));
    expect(screen.getByText('← Back to wallet options')).toBeInTheDocument();
  });

  it('returns to wallet view from magic link mode', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('magic-link-btn'));
    fireEvent.click(screen.getByText('← Back to wallet options'));
    expect(screen.getByText('Play as Guest')).toBeInTheDocument();
    expect(screen.getByText('LOBSTR')).toBeInTheDocument();
  });
});
