import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-react';

export const CartDrawer = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice, isOpen, setIsOpen } = useCart();
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<'SOL' | 'USDC' | 'PYUSD'>('SOL');
  const [processing, setProcessing] = useState(false);

  // Mock exchange rates - in production, fetch from a price API
  const exchangeRates = {
    SOL: 0.02, // 1 USD = 0.02 SOL (assuming SOL is $50)
    USDC: 1.0, // 1 USD = 1 USDC
    PYUSD: 1.0 // 1 USD = 1 PYUSD
  };

  const getTotalInCrypto = () => {
    const totalUSD = getTotalPrice();
    return (totalUSD * exchangeRates[selectedPayment]).toFixed(selectedPayment === 'SOL' ? 4 : 2);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Check if wallet is connected
      if (!window.solana || !window.solana.isConnected) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your Solana wallet to proceed",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      const totalAmount = parseFloat(getTotalInCrypto());
      
      // Simulate payment processing
      toast({
        title: "Processing Payment",
        description: `Processing ${totalAmount} ${selectedPayment} payment...`,
      });

      // In a real implementation, you would:
      // 1. Create a transaction with the Solana Web3.js library
      // 2. Handle token transfers for USDC/PYUSD
      // 3. Send SOL for native payments
      // 4. Confirm transaction on blockchain

      // Mock payment delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Payment Successful! 🎉",
        description: `Your order has been confirmed. Transaction completed with ${totalAmount} ${selectedPayment}`,
      });

      // Clear cart and close drawer
      clearCart();
      setIsOpen(false);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-black border-l-2 border-neon-cyan overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-2xl font-display text-neon-cyan flex items-center gap-2">
            <ShoppingCart size={24} />
            Shopping Cart
            {getTotalItems() > 0 && (
              <Badge className="bg-neon-pink text-black ml-2">
                {getTotalItems()} items
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="mt-4 cyber-button"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="border-neon-purple/30">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-bold text-neon-cyan text-sm">{item.name}</h4>
                          <div className="flex gap-2">
                            {item.selectedSize && (
                              <Badge variant="outline" className="text-xs border-neon-green text-neon-green">
                                {item.selectedSize}
                              </Badge>
                            )}
                            {item.selectedColor && (
                              <Badge variant="outline" className="text-xs border-neon-pink text-neon-pink">
                                {item.selectedColor}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 p-0 border-neon-cyan text-neon-cyan"
                              >
                                <Minus size={12} />
                              </Button>
                              <span className="text-neon-purple font-bold">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 p-0 border-neon-cyan text-neon-cyan"
                              >
                                <Plus size={12} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neon-green">${(item.price * item.quantity).toFixed(2)}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="h-6 w-6 p-0 border-red-500 text-red-500 hover:bg-red-500"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="bg-neon-cyan/30" />

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h4 className="font-bold text-neon-purple">Select Payment Method</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['SOL', 'USDC', 'PYUSD'] as const).map((method) => (
                    <Button
                      key={method}
                      variant={selectedPayment === method ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPayment(method)}
                      className={selectedPayment === method 
                        ? "bg-neon-cyan text-black border-neon-cyan" 
                        : "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                      }
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-neon-cyan/30" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-neon-green font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-neon-green">
                    {getTotalPrice() >= 75 ? 'FREE' : '$5.99'}
                  </span>
                </div>
                <Separator className="bg-neon-cyan/30" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-neon-cyan">Total:</span>
                  <div className="text-right">
                    <div className="text-neon-green font-bold">
                      ${(getTotalPrice() + (getTotalPrice() >= 75 ? 0 : 5.99)).toFixed(2)}
                    </div>
                    <div className="text-sm text-neon-purple">
                      {getTotalInCrypto()} {selectedPayment}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="space-y-3">
                <Button 
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full cyber-button text-lg py-3"
                >
                  <CreditCard size={20} className="mr-2" />
                  {processing ? 'Processing...' : `Pay ${getTotalInCrypto()} ${selectedPayment}`}
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    className="flex-1 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={clearCart}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Payment Info */}
              <Card className="bg-neon-cyan/10 border-neon-cyan/30">
                <CardContent className="p-3">
                  <p className="text-xs text-neon-cyan">
                    💡 <strong>Secure Payments:</strong> All transactions are processed on the Solana blockchain. 
                    Make sure your wallet has sufficient {selectedPayment} tokens.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};