-- Credit all wallets with 100 CCTR (balances already updated in previous migration)
-- Just record the transactions with a valid transaction type
INSERT INTO public.token_transactions (user_id, amount, transaction_type, description)
SELECT user_id, 100, 'claim', 'Bulk credit: 100 CCTR added to wallet'
FROM public.user_balances;