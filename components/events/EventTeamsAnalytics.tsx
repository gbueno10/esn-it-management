'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Link2,
  Link2Off,
  Users,
  Calendar,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface VolunteerEvent {
  sheet: string
  event_type: string
  event_name: string
  event_description: string
  role: string
  event_date: string | null
}

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
  events: VolunteerEvent[]
}

interface EventEntry {
  sheet: string
  event_type: string
  event_name: string
  event_description: string
  event_date: string | null
  team_size: number
  mos: string[]
  team_members: string[]
  team: string[]
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${day} ${months[m - 1]} ${y}`
}

type Tab = 'volunteers' | 'events'
type SortKey = 'name' | 'total' | 'mo' | 'team' | 'unique_events' | 'months_active'

export function EventTeamsAnalytics({
  leaderboard,
  events,
  sheets,
}: {
  leaderboard: VolunteerEntry[]
  events: EventEntry[]
  sheets: string[]
}) {
  const [tab, setTab] = useState<Tab>('volunteers')
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => { setTab('volunteers'); setSelectedEvent(null) }}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
            tab === 'volunteers'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Volunteers
        </button>
        <button
          onClick={() => { setTab('events'); setSelectedVolunteer(null) }}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
            tab === 'events'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Events
        </button>
      </div>

      {tab === 'volunteers' && (
        <VolunteerTab
          data={leaderboard}
          selectedVolunteer={selectedVolunteer}
          onSelectVolunteer={setSelectedVolunteer}
          onNavigateToEvent={(eventKey) => {
            setTab('events')
            setSelectedEvent(eventKey)
            setSelectedVolunteer(null)
          }}
        />
      )}

      {tab === 'events' && (
        <EventsTab
          events={events}
          sheets={sheets}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          onNavigateToVolunteer={(name) => {
            setTab('volunteers')
            setSelectedVolunteer(name)
            setSelectedEvent(null)
          }}
        />
      )}
    </div>
  )
}

// ── Volunteers Tab ───────────────────────────────────────────────────────────

function VolunteerTab({
  data,
  selectedVolunteer,
  onSelectVolunteer,
  onNavigateToEvent,
}: {
  data: VolunteerEntry[]
  selectedVolunteer: string | null
  onSelectVolunteer: (name: string | null) => void
  onNavigateToEvent: (key: string) => void
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortAsc, setSortAsc] = useState(false)
  const [filterMatch, setFilterMatch] = useState<'all' | 'matched' | 'unmatched'>('all')

  const filtered = useMemo(() => {
    let result = [...data]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) => v.name.toLowerCase().includes(q) || v.aliases.some((a) => a.toLowerCase().includes(q))
      )
    }
    if (filterMatch === 'matched') result = result.filter((v) => v.matched)
    if (filterMatch === 'unmatched') result = result.filter((v) => !v.matched)
    result.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string')
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return result
  }, [data, search, sortKey, sortAsc, filterMatch])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const selected = selectedVolunteer ? data.find((v) => v.name === selectedVolunteer) : null
  const matchCounts = {
    all: data.length,
    matched: data.filter((v) => v.matched).length,
    unmatched: data.filter((v) => !v.matched).length,
  }

  // If a volunteer is selected, show their detail
  if (selected) {
    return (
      <div>
        <button
          onClick={() => onSelectVolunteer(null)}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronRight className="h-3 w-3 rotate-180" /> Back to leaderboard
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold">{selected.name}</h3>
            {selected.matched ? (
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                <Link2 className="h-2.5 w-2.5 mr-1" /> Linked
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                <Link2Off className="h-2.5 w-2.5 mr-1" /> Unlinked
              </Badge>
            )}
          </div>
          <div className="flex gap-4 text-[12px] text-muted-foreground">
            <span><strong className="text-foreground">{selected.total}</strong> participations</span>
            <span><strong className="text-amber-600">{selected.mo}</strong> as MO</span>
            <span><strong className="text-foreground">{selected.team}</strong> as team</span>
            <span><strong className="text-foreground">{selected.months_active}</strong> months active</span>
          </div>
          {selected.aliases.length > 0 && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Also found as:{' '}
              {selected.aliases.map((a) => (
                <Badge key={a} variant="outline" className="text-[10px] mr-1">{a}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Date</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Event</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody>
              {[...selected.events].sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? '')).map((ev, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-[12px] text-muted-foreground whitespace-nowrap">{formatDate(ev.event_date)}</td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary" className="text-[10px]">{ev.event_type}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onNavigateToEvent(`${ev.sheet}|${ev.event_description}`)}
                      className="text-[12px] text-left hover:underline"
                    >
                      {ev.event_name || ev.event_description}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge
                      variant={ev.role === 'mo' ? 'default' : 'outline'}
                      className="text-[10px]"
                    >
                      {ev.role === 'mo' ? 'MO' : 'Team'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="text-[15px] font-semibold">Volunteer Leaderboard</h2>
        <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
          {filtered.length}
        </span>
      </div>

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

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="w-8 px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">#</th>
                <th className="px-3 py-2.5 text-left">
                  <SortBtn label="Name" k="name" current={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center">
                  <SortBtn label="Total" k="total" current={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center">
                  <SortBtn label="MO" k="mo" current={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center">
                  <SortBtn label="Team" k="team" current={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center hidden sm:table-cell">
                  <SortBtn label="Events" k="unique_events" current={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center hidden sm:table-cell">
                  <SortBtn label="Months" k="months_active" current={sortKey} asc={sortAsc} onClick={toggleSort} />
                </th>
                <th className="px-3 py-2.5 text-center w-16">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vol, i) => (
                <tr
                  key={vol.name}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectVolunteer(vol.name)}
                >
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground font-mono">
                    {i < 3 ? ['1st', '2nd', '3rd'][i] : i + 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[13px] font-medium">{vol.name}</span>
                    {vol.aliases.length > 0 && (
                      <span className="text-[10px] text-muted-foreground ml-1.5">+{vol.aliases.length}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center text-[13px] font-semibold">{vol.total}</td>
                  <td className="px-3 py-2.5 text-center text-[13px] text-amber-600 font-medium">{vol.mo}</td>
                  <td className="px-3 py-2.5 text-center text-[13px]">{vol.team}</td>
                  <td className="px-3 py-2.5 text-center text-[13px] text-muted-foreground hidden sm:table-cell">{vol.unique_events}</td>
                  <td className="px-3 py-2.5 text-center text-[13px] text-muted-foreground hidden sm:table-cell">{vol.months_active}</td>
                  <td className="px-3 py-2.5 text-center">
                    {vol.matched ? (
                      <Link2 className="h-3 w-3 text-emerald-600 mx-auto" />
                    ) : (
                      <Link2Off className="h-3 w-3 text-muted-foreground/40 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({
  events,
  sheets,
  selectedEvent,
  onSelectEvent,
  onNavigateToVolunteer,
}: {
  events: EventEntry[]
  sheets: string[]
  selectedEvent: string | null
  onSelectEvent: (key: string | null) => void
  onNavigateToVolunteer: (name: string) => void
}) {
  const [search, setSearch] = useState('')
  const [filterSheet, setFilterSheet] = useState<string>('all')

  const filtered = useMemo(() => {
    let result = [...events]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) =>
        (e.event_name || e.event_description).toLowerCase().includes(q) ||
        e.event_type.toLowerCase().includes(q)
      )
    }
    if (filterSheet !== 'all') {
      result = result.filter((e) => e.sheet === filterSheet)
    }
    result.sort((a, b) => (a.event_date ?? 'zzzz').localeCompare(b.event_date ?? 'zzzz'))
    return result
  }, [events, search, filterSheet])

  // Selected event detail
  const selected = selectedEvent
    ? events.find((e) => `${e.sheet}|${e.event_description}` === selectedEvent)
    : null

  if (selected) {
    return (
      <div>
        <button
          onClick={() => onSelectEvent(null)}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronRight className="h-3 w-3 rotate-180" /> Back to events
        </button>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">{selected.event_name || selected.event_description}</h3>
          <div className="flex gap-3 text-[12px] text-muted-foreground items-center">
            <Badge variant="secondary" className="text-[10px]">{selected.event_type}</Badge>
            <span>{formatDate(selected.event_date)}</span>
            <span><strong className="text-foreground">{selected.team_size}</strong> people</span>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Name</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody>
              {selected.mos.map((name) => (
                <tr key={`mo-${name}`} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onNavigateToVolunteer(name)}
                      className="text-[13px] font-medium hover:underline"
                    >
                      {name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge className="text-[10px]">MO</Badge>
                  </td>
                </tr>
              ))}
              {selected.team_members.map((name) => (
                <tr key={`team-${name}`} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onNavigateToVolunteer(name)}
                      className="text-[13px] hover:underline"
                    >
                      {name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant="outline" className="text-[10px]">Team</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="text-[15px] font-semibold">Events</h2>
        <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
          {filtered.length}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterSheet}
          onChange={(e) => setFilterSheet(e.target.value)}
          className="px-3 py-2 text-[12px] border rounded-md bg-background"
        >
          <option value="all">All months</option>
          {sheets.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Date</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Event</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground">MOs</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground">Team</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => {
                const key = `${ev.sheet}|${ev.event_description}`
                return (
                  <tr
                    key={key + i}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onSelectEvent(key)}
                  >
                    <td className="px-3 py-2 text-[12px] text-muted-foreground whitespace-nowrap">{formatDate(ev.event_date)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary" className="text-[10px]">{ev.event_type}</Badge>
                    </td>
                    <td className="px-3 py-2 text-[12px]">{ev.event_name || ev.event_description}</td>
                    <td className="px-3 py-2 text-center text-[12px] text-amber-600 font-medium">{ev.mos.length}</td>
                    <td className="px-3 py-2 text-center text-[12px]">{ev.team_members.length}</td>
                    <td className="px-3 py-2 text-center text-[12px] font-semibold">{ev.team_size}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function SortBtn({
  label, k, current, asc, onClick,
}: {
  label: string; k: SortKey; current: SortKey; asc: boolean; onClick: (k: SortKey) => void
}) {
  const active = current === k
  return (
    <button onClick={() => onClick(k)} className={`flex items-center gap-1 text-[11px] font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
      {label}
      <ArrowUpDown className={`h-3 w-3 ${active ? 'opacity-100' : 'opacity-40'}`} />
    </button>
  )
}
