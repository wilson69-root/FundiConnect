-- migrations/20240301000000_alter_payments_insert_policy.sql

-- This migration alters the RLS policy on the payments table
-- to restrict insert operations to authenticated users.

ALTER POLICY "Authenticated users can insert/update payments" ON payments
FOR INSERT TO authenticated
WITH CHECK (true);

-- Note: The original policy name "Authenticated users can insert/update payments"
-- might need to be confirmed based on your existing policies.
-- If you have separate policies for INSERT and UPDATE,
-- you will need to target the correct policy name for INSERT.