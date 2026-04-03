'use client'

import { useState } from 'react'
import { SchemaInfo, TableInfo } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'

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
        title="Nenhum schema encontrado"
        description="Não foi possível carregar os schemas. Verifica se a database function existe."
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      {schemas.map((schema) => {
        const isProject = projectSlugs.includes(schema.schema_name)
        const isExpanded = expandedSchema === schema.schema_name

        return (
          <div
            key={schema.schema_name}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {/* Schema Header */}
            <button
              onClick={() => toggleSchema(schema.schema_name)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  schema.schema_name === 'public'
                    ? 'bg-[var(--primary)]/10'
                    : isProject
                      ? 'bg-[var(--accent)]/10'
                      : 'bg-slate-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    schema.schema_name === 'public'
                      ? 'text-[var(--primary)]'
                      : isProject
                        ? 'text-[var(--accent)]'
                        : 'text-slate-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{schema.schema_name}</span>
                  {isProject && (
                    <span className="ml-2 text-xs text-[var(--accent)] font-medium">Projeto</span>
                  )}
                  {schema.schema_name === 'public' && (
                    <span className="ml-2 text-xs text-[var(--primary)] font-medium">Partilhado</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {schema.table_count > 0 && (
                  <span className="text-xs text-slate-400">{schema.table_count} tabelas</span>
                )}
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Tables */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-5 py-4">
                {loadingTables ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    A carregar tabelas...
                  </div>
                ) : tables.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">
                    Nenhuma tabela encontrada ou a database function não existe.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {tables.map((table) => (
                      <div key={table.table_name}>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {table.table_name}
                          <span className="text-xs text-slate-400 font-normal">
                            ({table.columns.length} colunas)
                          </span>
                        </h4>
                        <div className="bg-slate-50 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left font-medium text-slate-500 px-3 py-2">Coluna</th>
                                <th className="text-left font-medium text-slate-500 px-3 py-2">Tipo</th>
                                <th className="text-left font-medium text-slate-500 px-3 py-2">Nullable</th>
                                <th className="text-left font-medium text-slate-500 px-3 py-2">Default</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {table.columns.map((col) => (
                                <tr key={col.column_name}>
                                  <td className="px-3 py-1.5 font-mono text-slate-900">{col.column_name}</td>
                                  <td className="px-3 py-1.5 text-slate-600">{col.data_type}</td>
                                  <td className="px-3 py-1.5">
                                    <span className={col.is_nullable === 'YES' ? 'text-slate-400' : 'text-slate-700 font-medium'}>
                                      {col.is_nullable === 'YES' ? 'sim' : 'NOT NULL'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-1.5 text-slate-400 font-mono truncate max-w-[200px]">
                                    {col.column_default || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
