import { createClient } from '@supabase/supabase-js';

let adminClient;

function parseJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad = segment.length % 4;
  if (pad) segment += '='.repeat(4 - pad);
  try {
    return JSON.parse(Buffer.from(segment, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * The anon key is subject to RLS; inserts fail with "violates row-level security policy"
 * if SUPABASE_SERVICE_ROLE_KEY is accidentally set to the anon key.
 */
function assertSupabaseServiceRoleKey(key) {
  const payload = parseJwtPayload(key);
  if (!payload) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY does not look like a Supabase JWT. Copy the service_role secret from Supabase → Settings → API.'
    );
  }
  if (payload.role !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY must be the service_role secret (Settings → API), not the "${payload.role}" key. Wrong keys cause row-level security errors on insert.`
    );
  }
}

/**
 * Server-only Supabase client (service role). Use only in API routes / getServerSideProps.
 */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for database access.'
    );
  }

  assertSupabaseServiceRoleKey(key);

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}
