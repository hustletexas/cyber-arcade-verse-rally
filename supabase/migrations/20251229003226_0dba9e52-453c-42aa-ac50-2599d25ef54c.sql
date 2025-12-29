-- Consolidate user_roles policies to avoid multiple permissive SELECT policies

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Single SELECT policy covering both cases
CREATE POLICY "Users can view own roles or admins view all" ON user_roles
FOR SELECT
USING (
  (SELECT auth.uid()) = user_id
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'::app_role
  )
);

-- Admin-only policies for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert roles" ON user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update roles" ON user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete roles" ON user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'::app_role
  )
);