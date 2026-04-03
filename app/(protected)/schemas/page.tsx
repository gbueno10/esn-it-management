import { createPublicClient } from '@/lib/supabase/server'
import { isESNAdmin } from '@/lib/auth/permissions'
import { SchemaExplorer } from '@/components/schemas/SchemaExplorer'
import { redirect } from 'next/navigation'

export default async function SchemasPage() {
  const isAdmin = await isESNAdmin()

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const supabase = await createPublicClient()

  // Get project slugs to identify project schemas
  const { data: projects } = await supabase
    .from('projects')
    .select('slug')

  const projectSlugs = (projects || []).map((p) => p.slug)

  // Try to get schemas via RPC
  let schemas: { schema_name: string; table_count: number }[] = []

  const { data: schemaData } = await supabase.rpc('get_schemas_with_tables')

  if (schemaData) {
    const excluded = new Set([
      'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
      'graphql', 'graphql_public', 'pgbouncer', 'pgsodium', 'pgsodium_masks',
      'realtime', 'supabase_functions', 'supabase_migrations', 'vault',
      'pg_toast', 'pg_temp_1', 'pg_toast_temp_1', '_realtime', '_analytics', 'net', 'cron',
    ])
    schemas = schemaData.filter((s: { schema_name: string }) => !excluded.has(s.schema_name))
  } else {
    // Fallback: show public + project schemas
    schemas = [
      { schema_name: 'public', table_count: 0 },
      ...projectSlugs.map((slug) => ({ schema_name: slug, table_count: 0 })),
    ]
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Schemas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explorar os schemas da base de dados e as tabelas de cada projeto
        </p>
      </div>

      <SchemaExplorer schemas={schemas} projectSlugs={projectSlugs} />

      {/* SQL Functions Info */}
      <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Database Functions Necessárias</h3>
        <p className="text-xs text-slate-500 mb-3">
          Para ver os schemas e tabelas, cria estas funções no Supabase SQL Editor:
        </p>
        <pre className="text-xs bg-white rounded-lg p-4 border border-slate-200 overflow-x-auto text-slate-700">
{`-- Lista schemas com contagem de tabelas
CREATE OR REPLACE FUNCTION get_schemas_with_tables()
RETURNS TABLE(schema_name text, table_count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT s.schema_name::text, COUNT(t.table_name)::bigint as table_count
  FROM information_schema.schemata s
  LEFT JOIN information_schema.tables t ON s.schema_name = t.table_schema
    AND t.table_type = 'BASE TABLE'
  GROUP BY s.schema_name
  ORDER BY s.schema_name;
$$;

-- Lista tabelas e colunas de um schema
CREATE OR REPLACE FUNCTION get_schema_tables(schema_param text)
RETURNS TABLE(
  table_name text,
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    c.table_name::text,
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_schema = schema_param
  ORDER BY c.table_name, c.ordinal_position;
$$;`}
        </pre>
      </div>
    </div>
  )
}
