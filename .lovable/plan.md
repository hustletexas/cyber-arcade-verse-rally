

# Fix Duplicate Balances, Harden Init Function, and Fix RLS Policies

## Overview

There are **4 issues** to resolve: 1 data/function bug causing console errors, and 3 security policy weaknesses flagged by the scanner.

---

## Issue 1: Duplicate `user_balances` Records (Console Error)

**Root Cause**: The `initialize_wallet_balance` function changed its UUID namespace from `a0eebc99-...` to `6ba7b810-...` between versions. This means the same wallet address (`GA4WIVY7...`) now has **two records** with different `user_id` UUIDs:

```text
Namespace A (old):  deb21737-5fce-... -> cctr_balance: 50
Namespace B (current): f8ef809f-0d19-... -> cctr_balance: 10
```

When the function runs `SELECT ... WHERE wallet_address = ?`, it gets two rows back, causing the "query returned more than one row" Postgres error.

**Fix**:
1. Clean up duplicate records by merging balances into the record using the **current** namespace UUID, and deleting the old one
2. Remove orphaned records with NULL wallet addresses
3. Add a **UNIQUE constraint** on `wallet_address` to prevent future duplicates
4. Harden `initialize_wallet_balance` to use `LIMIT 1` and `FOR UPDATE` for safety

---

## Issue 2: `winner_chest_eligibility` RLS (Security Error)

**Current Policy**: Only checks `length(wallet_address) > 10` -- any user can read all records.

**Fix**: Replace with wallet-ownership check using `get_current_wallet_address()` so users can only see their own prize eligibility.

---

## Issue 3: `trivia_runs` RLS (Security Error)

**Current Policy**: Same weak `length(user_id) > 10` pattern -- all gaming activity is publicly visible.

**Fix**: Replace with a check that compares `user_id` to the connected wallet address via `get_current_wallet_address()`.

---

## Issue 4: `arcade_tournaments` Admin ID Exposure (Security Warning)

**Current Policy**: Public SELECT reveals the `admin_id` UUID for non-draft tournaments.

**Fix**: Create a secure view `arcade_tournaments_public` that masks `admin_id` for non-owners, and update the client code to query this view instead.

---

## Implementation Steps

### Step 1: Database Migration

A single migration will:

1. **Merge duplicate `user_balances`**: Combine balances from the old namespace UUID into the current one, then delete stale records
2. **Remove NULL wallet records**: Delete orphaned rows with no wallet address
3. **Add UNIQUE constraint**: `ALTER TABLE user_balances ADD CONSTRAINT user_balances_wallet_address_unique UNIQUE (wallet_address)` (after cleanup)
4. **Harden `initialize_wallet_balance`**: Add `LIMIT 1` to the initial lookup query, and use `FOR UPDATE` row locking
5. **Fix `winner_chest_eligibility` RLS**: Drop weak policies, create wallet-ownership policies using `get_current_wallet_address()`
6. **Fix `winner_chest_claims` RLS**: Same pattern (these share the same weak check)
7. **Fix `trivia_runs` RLS**: Drop weak policies, create `user_id = get_current_wallet_address()` policies
8. **Fix `arcade_tournaments`**: Create `arcade_tournaments_public` secure view masking `admin_id` for non-admins

### Step 2: Client Code Updates

1. **`src/hooks/useWinnerChests.tsx`**: Update queries from `winner_chest_eligibility` / `winner_chest_claims` to work correctly with the new RLS (no code change needed since queries already filter by wallet_address, they just need RLS to allow it)
2. **Any component querying `arcade_tournaments`**: Update to use the `arcade_tournaments_public` view

### Step 3: Security Finding Cleanup

Delete the 3 resolved security findings from the tracker.

---

## Technical Details

### Duplicate Cleanup SQL

```sql
-- Merge old namespace balance into current namespace record
UPDATE user_balances
SET cctr_balance = cctr_balance + 50
WHERE user_id = 'f8ef809f-0d19-500a-97dd-403ac8413d97';

DELETE FROM user_balances
WHERE user_id = 'deb21737-5fce-50b9-9efa-e221d170575b';

-- Remove NULL wallet orphans
DELETE FROM user_balances WHERE wallet_address IS NULL;

-- Prevent future duplicates
ALTER TABLE user_balances
ADD CONSTRAINT user_balances_wallet_address_unique UNIQUE (wallet_address);
```

### Hardened `initialize_wallet_balance` Changes

- Add `LIMIT 1` to the initial `SELECT ... WHERE wallet_address = ?` query
- Add `FOR UPDATE` row lock to prevent race conditions during concurrent requests
- Consistent namespace UUID (`6ba7b810-9dad-11d1-80b4-00c04fd430c8`)

### RLS Policy Pattern (winner_chest_eligibility example)

```sql
CREATE POLICY "Users can view own eligibility"
ON public.winner_chest_eligibility FOR SELECT
TO authenticated, anon
USING (wallet_address = (SELECT public.get_current_wallet_address()));
```

Since this is a wallet-only architecture (no guaranteed Supabase auth session), policies also need to allow the `SECURITY DEFINER` functions to operate on behalf of the user.

### Secure Tournament View

```sql
CREATE VIEW public.arcade_tournaments_public
WITH (security_invoker = true) AS
SELECT
  id, title, description, game, format, max_players, min_players,
  start_time, registration_deadline, entry_fee_usd, entry_fee_usdc,
  prize_pool_usd, payout_schema, custom_payout_percentages,
  requires_pass, required_pass_tier, status, rules, bracket_data,
  CASE
    WHEN admin_id = (SELECT auth.uid()) OR public.is_admin()
    THEN admin_id
    ELSE NULL
  END as admin_id,
  created_at, updated_at
FROM public.arcade_tournaments;
```

---

## Files to Modify

1. **New migration SQL** -- all database changes
2. **`src/hooks/useWinnerChests.tsx`** -- verify RLS compatibility (may need minor adjustments)
3. **Components querying `arcade_tournaments`** -- switch to `arcade_tournaments_public` view
4. **Security findings** -- delete 3 resolved findings

