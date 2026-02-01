
# Fix User Balance UUID Error

## Problem Summary
The `useUserBalance` hook is trying to insert records into `user_balances` with a fake UUID generated from the wallet address. This fails because:
1. The `user_id` column expects a valid UUID format
2. There's a foreign key constraint referencing `auth.users(id)`
3. With wallet-only authentication, there are no corresponding `auth.users` records

## Technical Details

### Current State
- `user_balances` table structure:
  - `user_id` (UUID, PRIMARY KEY, FK to auth.users)
  - `wallet_address` (TEXT)
  - `cctr_balance` (INTEGER)
  - `claimable_rewards` (INTEGER)
- Client code generates invalid UUID: `GA4WIVY7-2BVF-4SVH-aDHN-2V25JW5CHSM7`
- RLS blocks direct INSERT: policy `"No direct balance inserts"` has `WITH CHECK (false)`

### Solution
Create a secure `SECURITY DEFINER` function to initialize wallet balances, bypassing the FK constraint by using a generated UUID that's not tied to auth.users (after removing the FK constraint).

---

## Implementation Steps

### Step 1: Database Migration
Create a new secure function to initialize balances and restructure the table:

```sql
-- Remove FK constraint to auth.users (wallet-only architecture)
ALTER TABLE public.user_balances 
DROP CONSTRAINT IF EXISTS user_balances_user_id_fkey;

-- Create function to initialize wallet balances
CREATE OR REPLACE FUNCTION public.initialize_wallet_balance(p_wallet_address TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_result RECORD;
BEGIN
  -- Validate wallet address
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;
  
  -- Check if wallet already has a balance record
  SELECT user_id, cctr_balance, claimable_rewards INTO v_result
  FROM user_balances
  WHERE wallet_address = p_wallet_address;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true, 
      'cctr_balance', v_result.cctr_balance,
      'claimable_rewards', v_result.claimable_rewards,
      'created', false
    );
  END IF;
  
  -- Generate a deterministic UUID from wallet address
  v_user_id := uuid_generate_v5(uuid_nil(), p_wallet_address);
  
  -- Insert new balance record with starter tokens
  INSERT INTO user_balances (user_id, wallet_address, cctr_balance, claimable_rewards, updated_at)
  VALUES (v_user_id, p_wallet_address, 100, 0, now())
  ON CONFLICT (user_id) DO UPDATE 
    SET wallet_address = EXCLUDED.wallet_address
  RETURNING cctr_balance, claimable_rewards INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true, 
    'cctr_balance', v_result.cctr_balance,
    'claimable_rewards', v_result.claimable_rewards,
    'created', true
  );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.initialize_wallet_balance(TEXT) TO anon, authenticated;
```

### Step 2: Update Client Code
Modify `src/hooks/useUserBalance.tsx` to use the new RPC function:

```typescript
// Replace the fake UUID generation logic (lines 44-69) with:
if (!data) {
  // Use secure server-side function to initialize balance
  const { data: initResult, error: initError } = await supabase
    .rpc('initialize_wallet_balance', {
      p_wallet_address: primaryWallet.address
    });

  if (initError) {
    console.error('Error initializing balance:', initError);
    setBalance({ cctr_balance: 0, claimable_rewards: 0 });
  } else if (initResult?.success) {
    setBalance({
      cctr_balance: initResult.cctr_balance || 0,
      claimable_rewards: initResult.claimable_rewards || 0
    });
  }
}
```

### Step 3: Fix TypeScript Export Error
The previous change to `useWalletBalances.tsx` has a duplicate type definition. Fix by:
- Remove the duplicate `StellarAsset` interface (lines 13-18) since it already exists at line 22
- Ensure the export is correct at the end of the file

---

## Files to Modify
1. **Database migration** - Add `initialize_wallet_balance` function, drop FK constraint
2. **src/hooks/useUserBalance.tsx** - Use RPC instead of direct INSERT
3. **src/hooks/useWalletBalances.tsx** - Clean up duplicate type definition

## Security Considerations
- The new function uses `SECURITY DEFINER` to bypass RLS
- UUID is deterministically generated from wallet address (consistent)
- Rate limiting should be added if abuse is observed
- Starter balance of 100 CCTR is granted on first wallet connection
