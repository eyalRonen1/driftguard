-- Enable Row Level Security on all tables
-- Defense-in-depth: even though queries go through the application layer
-- (which filters by org_id), RLS provides a safety net against:
-- 1. Future queries that forget org scoping
-- 2. Direct Supabase client access with anon/authenticated roles
-- 3. SQL injection bypasses (already mitigated by Drizzle parameterized queries)

-- Note: The Drizzle ORM connection uses the postgres/service role which
-- bypasses RLS. These policies protect against Supabase client (anon/authenticated) access.

-- ==========================================
-- USERS
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (supabase_auth_id = auth.uid());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (supabase_auth_id = auth.uid());

-- ==========================================
-- ORGANIZATIONS
-- ==========================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_select_own"
  ON organizations FOR SELECT
  USING (owner_id IN (
    SELECT id FROM users WHERE supabase_auth_id = auth.uid()
  ));

CREATE POLICY "orgs_update_own"
  ON organizations FOR UPDATE
  USING (owner_id IN (
    SELECT id FROM users WHERE supabase_auth_id = auth.uid()
  ));

-- ==========================================
-- MONITORS
-- ==========================================
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monitors_select_own_org"
  ON monitors FOR SELECT
  USING (org_id IN (
    SELECT id FROM organizations WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  ));

CREATE POLICY "monitors_insert_own_org"
  ON monitors FOR INSERT
  WITH CHECK (org_id IN (
    SELECT id FROM organizations WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  ));

CREATE POLICY "monitors_update_own_org"
  ON monitors FOR UPDATE
  USING (org_id IN (
    SELECT id FROM organizations WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  ));

CREATE POLICY "monitors_delete_own_org"
  ON monitors FOR DELETE
  USING (org_id IN (
    SELECT id FROM organizations WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  ));

-- ==========================================
-- SNAPSHOTS (no org_id — scoped via monitor)
-- ==========================================
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_select_own_monitors"
  ON snapshots FOR SELECT
  USING (monitor_id IN (
    SELECT id FROM monitors WHERE org_id IN (
      SELECT id FROM organizations WHERE owner_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  ));

-- ==========================================
-- CHANGES
-- ==========================================
ALTER TABLE changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "changes_select_own_org"
  ON changes FOR SELECT
  USING (org_id IN (
    SELECT id FROM organizations WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  ));

-- ==========================================
-- ALERT CONFIGS
-- ==========================================
ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alert_configs_all_own_org"
  ON alert_configs FOR ALL
  USING (org_id IN (
    SELECT id FROM organizations WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  ));
