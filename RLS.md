-- Step 1: First, let's ensure the database roles and permissions are correct
-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 2: Create or replace the user ID extraction function
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
DECLARE
jwt_claims jsonb;
user_id text;
BEGIN
-- Get JWT claims
BEGIN
jwt_claims := current_setting('request.jwt.claims', true)::jsonb;
EXCEPTION
WHEN OTHERS THEN
RETURN NULL;
END;

    -- Check if claims exist
    IF jwt_claims IS NULL THEN
        RETURN NULL;
    END IF;

    -- Extract user ID from 'sub' claim
    user_id := jwt_claims->>'sub';

    RETURN NULLIF(user_id, '');

END;

$$
LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 3: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION requesting_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION requesting_user_id() TO anon;

-- Step 4: Create debug function with proper permissions
CREATE OR REPLACE FUNCTION debug_jwt_info()
RETURNS TABLE(
    user_id text,
    role text,
    full_claims jsonb,
    function_result text
) AS
$$

BEGIN
RETURN QUERY
SELECT
current_setting('request.jwt.claims', true)::jsonb->>'sub' as user_id,
current_setting('request.jwt.claims', true)::jsonb->>'role' as role,
current_setting('request.jwt.claims', true)::jsonb as full_claims,
requesting_user_id() as function_result;
END;

$$
LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions on debug function
GRANT EXECUTE ON FUNCTION debug_jwt_info() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_jwt_info() TO anon;

-- Step 5: Disable RLS temporarily to test
ALTER TABLE "public"."Notification" DISABLE ROW LEVEL SECURITY;

-- Step 6: Drop all existing policies
DROP POLICY IF EXISTS "notifications_select_policy" ON "public"."Notification";
DROP POLICY IF EXISTS "notifications_insert_policy" ON "public"."Notification";
DROP POLICY IF EXISTS "notifications_update_policy" ON "public"."Notification";
DROP POLICY IF EXISTS "notifications_delete_policy" ON "public"."Notification";
DROP POLICY IF EXISTS "notifications_debug_policy" ON "public"."Notification";

-- Step 7: Grant basic permissions on the table
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Notification" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Notification" TO anon;

-- Step 8: Test without RLS first - this should work
-- Once you confirm this works, we'll re-enable RLS with proper policies

-- Step 9: When ready to re-enable RLS, run these commands:

-- Re-enable RLS
ALTER TABLE "public"."Notification" ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "notifications_select_policy"
ON "public"."Notification"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    "userId" = requesting_user_id()
);

CREATE POLICY "notifications_insert_policy"
ON "public"."Notification"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    "userId" = requesting_user_id()
);

CREATE POLICY "notifications_update_policy"
ON "public"."Notification"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ("userId" = requesting_user_id())
WITH CHECK ("userId" = requesting_user_id());

CREATE POLICY "notifications_delete_policy"
ON "public"."Notification"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ("userId" = requesting_user_id());

$$
