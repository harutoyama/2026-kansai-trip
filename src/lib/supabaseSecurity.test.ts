import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const readRepoFile = (path: string) =>
  readFileSync(resolve(cwd(), path), 'utf8')

const securitySqlFiles = [
  'supabase/schema.sql',
  'supabase/migrations/20260721_trip_pin_access.sql',
  'supabase/migrations/20260721_trip_pin_access_fix.sql',
] as const

const securitySqlCases = securitySqlFiles.map((path) => [path] as const)

describe('Supabase trip PIN security SQL', () => {
  it.each(securitySqlCases)('%s resolves pgcrypto explicitly', (path) => {
    const sql = readRepoFile(path)

    expect(sql).toContain('extensions.crypt(input_pin, configured_hash)')
    expect(sql).not.toContain('or crypt(input_pin, configured_hash)')
  })

  it.each(securitySqlCases)(
    '%s hardens SECURITY DEFINER search paths',
    (path) => {
      const sql = readRepoFile(path)

      expect(sql).toContain("set search_path = ''")
      expect(sql).not.toContain('set search_path = public, private')
      expect(sql).toContain('perform pg_catalog.pg_sleep(0.35);')
    },
  )

  it.each(securitySqlCases)(
    '%s denies unauthenticated RPC execution',
    (path) => {
      const sql = readRepoFile(path)

      expect(sql).toContain(
        'revoke execute on function public.verify_trip_pin(text) from public, anon, authenticated;',
      )
      expect(sql).toContain(
        'grant execute on function public.verify_trip_pin(text) to authenticated;',
      )
    },
  )

  it.each(securitySqlCases)(
    '%s enables RLS on private access tables',
    (path) => {
      const sql = readRepoFile(path)

      expect(sql).toContain(
        'alter table private.trip_access_config enable row level security;',
      )
      expect(sql).toContain(
        'alter table private.trip_access_members enable row level security;',
      )
    },
  )

  it('never commits the family PIN literal', () => {
    for (const path of securitySqlFiles) {
      expect(readRepoFile(path)).not.toMatch(/crypt\('\d{4}'/)
    }
  })
})
