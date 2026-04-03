'use client'

import { useState } from 'react'
import { SchemaInfo, TableInfo } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Database, ChevronDown, Loader2, TableIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SchemaExplorerProps {
  schemas: SchemaInfo[]
  projectSlugs: string[]
}

export function SchemaExplorer({ schemas, projectSlugs }: SchemaExplorerProps) {
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loadingTables, setLoadingTables] = useState(false)

  async function toggleSchema(schemaName: string) {
    if (expandedSchema === schemaName) {
      setExpandedSchema(null)
      setTables([])
      return
    }
    setExpandedSchema(schemaName)
    setLoadingTables(true)
    try {
      const res = await fetch(`/api/schemas/${schemaName}/tables`)
      if (res.ok) {
        const { data } = await res.json()
        setTables(data || [])
      } else {
        setTables([])
      }
    } catch {
      setTables([])
    }
    setLoadingTables(false)
  }

  if (schemas.length === 0) {
    return (
      <EmptyState
        title="No schemas found"
        description="Could not load schemas. Check if the database function exists."
        icon={<Database className="h-8 w-8" />}
      />
    )
  }

  return (
    <div className="space-y-3">
      {schemas.map((schema) => {
        const isProject = projectSlugs.includes(schema.schema_name)
        const isExpanded = expandedSchema === schema.schema_name

        return (
          <Card key={schema.schema_name}>
            <button
              onClick={() => toggleSchema(schema.schema_name)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  schema.schema_name === 'public' ? 'bg-primary/10' : isProject ? 'bg-green-100' : 'bg-muted'
                )}>
                  <Database className={cn(
                    'h-5 w-5',
                    schema.schema_name === 'public' ? 'text-primary' : isProject ? 'text-green-600' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{schema.schema_name}</span>
                  {isProject && <Badge variant="secondary">Project</Badge>}
                  {schema.schema_name === 'public' && <Badge variant="default">Shared</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {schema.table_count > 0 && (
                  <span className="text-xs text-muted-foreground">{schema.table_count} tables</span>
                )}
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
              </div>
            </button>

            {isExpanded && (
              <CardContent className="pt-0 pb-4">
                {loadingTables ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tables...
                  </div>
                ) : tables.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No tables found or the database function doesn&apos;t exist.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {tables.map((table) => (
                      <div key={table.table_name}>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TableIcon className="h-4 w-4 text-muted-foreground" />
                          {table.table_name}
                          <span className="text-xs text-muted-foreground font-normal">({table.columns.length} columns)</span>
                        </h4>
                        <div className="bg-muted/50 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Column</TableHead>
                                <TableHead className="text-xs">Type</TableHead>
                                <TableHead className="text-xs">Nullable</TableHead>
                                <TableHead className="text-xs">Default</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.columns.map((col) => (
                                <TableRow key={col.column_name}>
                                  <TableCell className="font-mono text-xs py-1.5">{col.column_name}</TableCell>
                                  <TableCell className="text-xs py-1.5">{col.data_type}</TableCell>
                                  <TableCell className="text-xs py-1.5">
                                    <span className={col.is_nullable === 'YES' ? 'text-muted-foreground' : 'font-medium'}>
                                      {col.is_nullable === 'YES' ? 'yes' : 'NOT NULL'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-xs py-1.5 font-mono text-muted-foreground truncate max-w-[200px]">
                                    {col.column_default || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
