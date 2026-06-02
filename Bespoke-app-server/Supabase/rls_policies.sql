-- Run in the Supabase SQL editor (or via migration) after AuthUserId exists on Users.
-- RLS is assumed enabled on these tables. Policies use auth.uid() = Users.AuthUserId.

-- Users
DROP POLICY IF EXISTS "users_select_own" ON "Users";
CREATE POLICY "users_select_own" ON "Users"
    FOR SELECT USING (auth.uid() = "AuthUserId");

DROP POLICY IF EXISTS "users_insert_own" ON "Users";
CREATE POLICY "users_insert_own" ON "Users"
    FOR INSERT WITH CHECK (auth.uid() = "AuthUserId");

DROP POLICY IF EXISTS "users_update_own" ON "Users";
CREATE POLICY "users_update_own" ON "Users"
    FOR UPDATE USING (auth.uid() = "AuthUserId");

-- SavedDuas
DROP POLICY IF EXISTS "saved_duas_own" ON "SavedDuas";
CREATE POLICY "saved_duas_own" ON "SavedDuas"
    FOR ALL
    USING (
        "UserId" IN (SELECT "UserId" FROM "Users" WHERE "AuthUserId" = auth.uid())
    )
    WITH CHECK (
        "UserId" IN (SELECT "UserId" FROM "Users" WHERE "AuthUserId" = auth.uid())
    );

-- UserUsages
DROP POLICY IF EXISTS "user_usages_select_own" ON "UserUsages";
CREATE POLICY "user_usages_select_own" ON "UserUsages"
    FOR SELECT USING (
        "UserId" IN (SELECT "UserId" FROM "Users" WHERE "AuthUserId" = auth.uid())
    );

DROP POLICY IF EXISTS "user_usages_insert_own" ON "UserUsages";
CREATE POLICY "user_usages_insert_own" ON "UserUsages"
    FOR INSERT WITH CHECK (
        "UserId" IN (SELECT "UserId" FROM "Users" WHERE "AuthUserId" = auth.uid())
    );

DROP POLICY IF EXISTS "user_usages_update_own" ON "UserUsages";
CREATE POLICY "user_usages_update_own" ON "UserUsages"
    FOR UPDATE USING (
        "UserId" IN (SELECT "UserId" FROM "Users" WHERE "AuthUserId" = auth.uid())
    );

-- SubscriptionOwnerships
DROP POLICY IF EXISTS "subscription_ownerships_select_own" ON "SubscriptionOwnerships";
CREATE POLICY "subscription_ownerships_select_own" ON "SubscriptionOwnerships"
    FOR SELECT USING (
        "UserId" IN (SELECT "UserId" FROM "Users" WHERE "AuthUserId" = auth.uid())
    );
