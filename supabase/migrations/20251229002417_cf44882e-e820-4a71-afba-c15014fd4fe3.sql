-- Fix RLS policy on user_roles table to use subselect for auth.uid()

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

CREATE POLICY "Admins can manage roles" ON user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'::app_role
  )
);