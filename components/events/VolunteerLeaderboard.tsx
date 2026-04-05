'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Link2, Link2Off } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface VolunteerEntry {
  name: string
  total: number
  mo: number
  team: number
  unique_events: number
  months_active: number
  member_id: string | null
  member_status: string | null
  matched: boolean
  aliases: string[]
}

type SortKey = 'name' | 'total' | 'mo' | 'team' | 'unique_events' | 'months_active'

export function VolunteerLeaderboard({
  data,
  sheets,
}: {
  data: VolunteerEntry[]
  sheets: string[]
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortAsc, setSortAsc] = useState(false)
  const [filterMatch, setFilterMatch] = useState<'all' | 'matched' | 'unmatched'>('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...data]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.aliases.some((a) => a.toLowerCase().includes(q))
      )
    }

    if (filterMatch === 'matched') result = result.filter((v) => v.matched)
    if (filterMatch === 'unmatched') result = result.filter((v) => !v.matched)

    result.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

    return result
  }, [data, search, sortKey, sortAsc, filterMatch])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const matchCounts = {
    all: data.length,
    matched: data.filter((v) => v.matched).length,
    unmatched: data.filter((v) => !v.matched).length,
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="text-[15px] font-semibold">Volunteer Leaderboard</h2>
        <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
          {filtered.length}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'matched', 'unmatched'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterMatch(f)}
              className={`px-3 py-1.5 text-[12px] rounded-md border transition-colors ${
                filterMatch === f
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'All' : f === 'matched' ? 'Linked' : 'Unlinked'}{' '}
              <span className="opacity-60">{matchCounts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="w-8 px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">#</th>
                <th className="px-3 py-2.5 text-left">
                  <SortButton label="Name" sortKey="name" currentKey={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center">
                  <SortButton label="Total" sortKey="total" currentKey={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center">
                  <SortButton label="MO" sortKey="mo" currentKey={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center">
                  <SortButton label="Team" sortKey="team" currentKey={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center hidden sm:table-cell">
                  <SortButton label="Events" sortKey="unique_events" currentKey={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center hidden sm:table-cell">
                  <SortButton label="Months" sortKey="months_active" currentKey={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vol, i) => {
                const isExpanded = expandedRow === vol.name
                return (
                  <VolunteerRow
                    key={vol.name}
                    vol={vol}
                    rank={i + 1}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedRow(isExpanded ? null : vol.name)}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SortButton({
  label,
  sortKey,
  currentKey,
  asc,
  onClick,
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  asc: boolean
  onClick: (key: SortKey) => void
}) {
  const active = currentKey === sortKey
  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`flex items-center gap-1 text-[11px] font-semibold ${
        active ? 'text-foreground' : 'text-muted-foreground'
      }`}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${active ? 'opacity-100' : 'opacity-40'}`} />
    </button>
  )
}

function VolunteerRow({
  vol,
  rank,
  isExpanded,
  onToggle,
}: {
  vol: VolunteerEntry
  rank: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasAliases = vol.aliases.length > 0
  const moPercent = vol.total > 0 ? Math.round((vol.mo / vol.total) * 100) : 0

  return (
    <>
      <tr
        className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
          hasAliases ? 'cursor-pointer' : ''
        }`}
        onClick={hasAliases ? onToggle : undefined}
      >
        <td className="px-3 py-2.5 text-[12px] text-muted-foreground font-mono">
          {rank <= 3 ? ['', '1st', '2nd', '3rd'][rank] : rank}
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            {hasAliases ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )
            ) : (
              <div className="w-3" />
            )}
            <span className="text-[13px] font-medium">{vol.name}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className="text-[13px] font-semibold">{vol.total}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className="text-[13px] text-amber-600 font-medium">{vol.mo}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className="text-[13px]">{vol.team}</span>
        </td>
        <td className="px-3 py-2.5 text-center hidden sm:table-cell">
          <span className="text-[13px] text-muted-foreground">{vol.unique_events}</span>
        </td>
        <td className="px-3 py-2.5 text-center hidden sm:table-cell">
          <span className="text-[13px] text-muted-foreground">{vol.months_active}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          {vol.matched ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
              <Link2 className="h-3 w-3" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50">
              <Link2Off className="h-3 w-3" />
            </span>
          )}
        </td>
      </tr>
      {isExpanded && hasAliases && (
        <tr className="bg-muted/20">
          <td />
          <td colSpan={7} className="px-3 py-2 pl-11">
            <div className="text-[11px] text-muted-foreground">
              <span className="font-medium">Also found as: </span>
              {vol.aliases.map((alias, i) => (
                <Badge key={alias} variant="outline" className="text-[10px] mr-1 mb-1">
                  {alias}
                </Badge>
              ))}
            </div>
            {vol.member_status && (
              <div className="text-[11px] text-muted-foreground mt-1">
                <span className="font-medium">Member status: </span>
                <Badge variant="secondary" className="text-[10px]">
                  {vol.member_status}
                </Badge>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
