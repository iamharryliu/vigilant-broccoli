#!/bin/bash

set -e

SUPABASE_URL="${1:-}"
PUBLISHABLE_KEY="${2:-}"
# Mirrors api.db_schema in infrastructure/terraform/supabase-auth.tf: the
# schemas PostgREST serves to the browser with the publishable key.
EXPOSED_SCHEMAS="'public','graphql_public'"
# Read and written only with the secret key; RLS with no policies is the only
# thing keeping refresh tokens away from the publishable key.
SERVER_ONLY_TABLES=(google_oauth_tokens spotify_oauth_tokens)

if [ -z "${SUPABASE_URL}" ] || [ -z "${PUBLISHABLE_KEY}" ] || [ -z "${PGPASSWORD:-}" ]; then
  echo "Usage: PGHOST=... PGUSER=... PGPASSWORD=... $0 <supabase-url> <publishable-key>"
  exit 2
fi

FAILED=0

catalog_query() {
  psql -X -qtA -v ON_ERROR_STOP=1 -c "$1"
}

report_offenders() {
  local passed_message="$1"
  local failed_message="$2"
  local offenders="$3"
  if [ -z "${offenders}" ]; then
    echo "✓ Passed: ${passed_message}"
  else
    echo "✗ Failed: ${failed_message}"
    echo "${offenders}" | sed 's/^/  - /'
    FAILED=1
  fi
}

echo "Testing Supabase row-level security: ${SUPABASE_URL}"

echo ""
echo "Test 1: Every table in an exposed schema has RLS enabled"
OFFENDERS=$(catalog_query "
  SELECT n.nspname || '.' || c.relname
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p') AND n.nspname IN (${EXPOSED_SCHEMAS})
    AND NOT c.relrowsecurity
  ORDER BY 1")
report_offenders "all exposed tables enforce RLS" \
  "tables readable through the publishable key without RLS" "${OFFENDERS}"

echo ""
echo "Test 2: No anon/authenticated-readable view, materialized view or foreign table bypasses RLS"
# A view without security_invoker runs as its owner, so it skips the RLS of
# every table it reads; materialized and foreign tables cannot have RLS at all.
OFFENDERS=$(catalog_query "
  SELECT n.nspname || '.' || c.relname
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('v', 'm', 'f') AND n.nspname IN (${EXPOSED_SCHEMAS})
    AND (has_table_privilege('anon', c.oid, 'SELECT')
      OR has_table_privilege('authenticated', c.oid, 'SELECT'))
    AND NOT (c.relkind = 'v' AND EXISTS (
      SELECT 1 FROM unnest(COALESCE(c.reloptions, '{}')) AS opt
      WHERE lower(opt) IN ('security_invoker=true', 'security_invoker=on', 'security_invoker=1')))
  ORDER BY 1")
report_offenders "every readable view runs with security_invoker" \
  "relations that expose rows without the caller's RLS" "${OFFENDERS}"

echo ""
echo "Test 3: Server-only tables exist and have no RLS policies"
SERVER_ONLY_LIST=$(printf "'%s'," "${SERVER_ONLY_TABLES[@]}")
SERVER_ONLY_LIST="${SERVER_ONLY_LIST%,}"
OFFENDERS=$(catalog_query "
  SELECT expected.name || ': ' || CASE WHEN c.oid IS NULL THEN 'missing' ELSE count(p.policyname) || ' policies' END
  FROM unnest(ARRAY[${SERVER_ONLY_LIST}]) AS expected(name)
  LEFT JOIN pg_class c ON c.relname = expected.name
    AND c.relnamespace = 'public'::regnamespace
  LEFT JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = expected.name
  GROUP BY expected.name, c.oid
  HAVING c.oid IS NULL OR count(p.policyname) > 0
  ORDER BY 1")
report_offenders "server-only tables exist and grant no policy" \
  "server-only tables missing or reachable through a policy (update SERVER_ONLY_TABLES if a table was renamed)" \
  "${OFFENDERS}"

echo ""
echo "Test 4: The publishable key reads zero rows from every exposed relation"
RELATIONS=$(catalog_query "
  SELECT n.nspname || ' ' || c.relname
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f') AND n.nspname IN (${EXPOSED_SCHEMAS})
  ORDER BY 1")
OFFENDERS=""
while read -r schema relation; do
  [ -z "${relation}" ] && continue
  # Only the status and row count are kept; a leaked row is never printed.
  RESPONSE=$(curl -s --max-time 15 -w '\n%{http_code}' \
    "${SUPABASE_URL}/rest/v1/${relation}?select=*&limit=1" \
    -H "apikey: ${PUBLISHABLE_KEY}" -H "Accept-Profile: ${schema}") || RESPONSE=$'\n000'
  HTTP_CODE="${RESPONSE##*$'\n'}"
  BODY="${RESPONSE%$'\n'*}"
  case "${HTTP_CODE}" in
    200)
      [ "${BODY}" = "[]" ] || OFFENDERS+="${schema}.${relation}: returned rows"$'\n'
      ;;
    401 | 403 | 404 | 406) ;;
    *)
      OFFENDERS+="${schema}.${relation}: unexpected HTTP ${HTTP_CODE}"$'\n'
      ;;
  esac
done <<< "${RELATIONS}"
report_offenders "$(echo "${RELATIONS}" | grep -c .) relations returned no rows" \
  "relations returning rows to the publishable key" "${OFFENDERS%$'\n'}"

echo ""
echo "Test 5: The publishable key cannot insert into server-only tables"
# An empty row: RLS WITH CHECK runs before NOT NULL constraints, so a working
# policy answers 42501, and a broken one still writes nothing because the
# primary key is null (23502).
OFFENDERS=""
for table in "${SERVER_ONLY_TABLES[@]}"; do
  BODY=$(curl -s --max-time 15 -X POST "${SUPABASE_URL}/rest/v1/${table}" \
    -H "apikey: ${PUBLISHABLE_KEY}" -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" -d '{}') || BODY=""
  echo "${BODY}" | grep -q '"code":"42501"' ||
    OFFENDERS+="${table}: insert not rejected by RLS (${BODY:-no response})"$'\n'
done
report_offenders "RLS rejected every insert" \
  "server-only tables accepting writes past RLS" "${OFFENDERS%$'\n'}"

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ Supabase RLS security checks failed"
  exit 1
fi
echo "✓ Supabase RLS security checks passed"
