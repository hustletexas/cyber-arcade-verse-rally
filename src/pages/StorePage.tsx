import React, { useState, useRef, useMemo } from 'react';

import { QuickShopStrip } from '@/components/store/QuickShopStrip';
import { LimitedDropSection } from '@/components/store/LimitedDropSection';
import { TrustSection } from '@/components/store/TrustSection';
import { SpotlightProduct } from '@/components/store/SpotlightProduct';
import { SocialProofSection } from '@/components/store/SocialProofSection';
import { BrandIdentitySection } from '@/components/store/BrandIdentitySection';
import { StoreFooter } from '@/components/store/StoreFooter';
import { StoreNav } from '@/components/store/StoreNav';
import { StickyBottomCTA } from '@/components/store/StickyBottomCTA';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductDetailDialog } from '@/components/store/ProductDetailDialog';
import { merchandiseItems, type MerchandiseItem } from '@/data/storeProducts';

const StorePage = () => {
  const [selectedItem, setSelectedItem] = useState<MerchandiseItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const shopRef = useRef<HTMLDivElement>(null);
  const limitedRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const base = merchandiseItems.filter(item => item.id !== '16');
    if (activeCategory === 'all') return base;
    return base.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const scrollToShop = () => shopRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToLimited = () => limitedRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    scrollToShop();
  };

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: 'url(/images/store/store-hero-bg-v3.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
    }}>
      <StoreNav onCategorySelect={handleCategorySelect} />
      {/* Spacer to show background title */}
      <div className="h-[20vh]" />
      <div ref={shopRef}>
        <QuickShopStrip items={filteredItems} onSelectItem={setSelectedItem} />
      </div>
      <div ref={limitedRef}>
        <LimitedDropSection onSelectItem={setSelectedItem} />
      </div>
      <TrustSection />
      <SpotlightProduct onSelectItem={setSelectedItem} />
      <SocialProofSection />
      <BrandIdentitySection onShop={scrollToShop} />
      <StoreFooter />
      
      <CartDrawer />
      <ProductDetailDialog item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default StorePage;
