# Supabase files

- `migrations/20260812000100_cineverse_schema.sql` creates the schema, indexes, RLS policies, and public read-only RPCs.
- `seed.sql` inserts fictional sample records only. It includes a private permission record and a draft movie so RLS can be verified.

Apply the migration before the seed. Do not use a secret key or a database password in the static site.
