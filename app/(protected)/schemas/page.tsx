import { createPublicClient } from '@/lib/supabase/server'
import { isESNAdmin } from '@/lib/auth/permissions'
import { SchemaExplorer } from '@/components/schemas/SchemaExplorer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function SchemasPage() {
  const isAdmin = await isESNAdmin()
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createPublicClient()

  const { data: projects } = await supabase.from('projects').select('slug')
  const projectSlugs = (projects || []).map((p) => p.slug)

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
    schemas = [
      { schema_name: 'public', table_count: 0 },
      ...projectSlugs.map((slug) => ({ schema_name: slug, table_count: 0 })),
    ]
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Schemas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore database schemas and tables for each project
        </p>
      </div>

      <SchemaExplorer schemas={schemas} projectSlugs={projectSlugs} />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Required Database Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            To view schemas and tables, create these functions in the Supabase SQL Editor:
          </p>
          <pre className="text-xs bg-muted rounded-lg p-4 overflow-x-auto">
{`-- List schemas with table count
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

-- List tables and columns of a schema
CREATE OR REPLACE FUNCTION get_schema_tables(schema_param text)
RETURNS TABLE(
  table_name text, column_name text, data_type text,
  is_nullable text, column_default text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT c.table_name::text, c.column_name::text, c.data_type::text,
    c.is_nullable::text, c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_schema = schema_param
  ORDER BY c.table_name, c.ordinal_position;
$$;`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
