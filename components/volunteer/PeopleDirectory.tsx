'use client'

import { useState } from 'react'
import { VolunteerStatus } from '@/types'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Flag, Camera, MessageCircle, Mail, Phone, Globe, AtSign, GraduationCap, SendHorizonal, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface VolunteerSummary {
  id: string
  name: string
  photo_url: string | null
  status: VolunteerStatus
  join_semester: string | null
  nationality: string | null
  country: string | null
  contacts: Record<string, string>
}

interface PeopleDirectoryProps {
  volunteers: VolunteerSummary[]
}

const statusConfig: Record<VolunteerStatus, { label: string; color: string; bg: string }> = {
  new_member: { label: 'New Member', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  member: { label: 'Member', color: 'text-amber-600', bg: 'bg-amber-500' },
  board: { label: 'Board', color: 'text-purple-600', bg: 'bg-purple-500' },
  inactive_member: { label: 'Inactive', color: 'text-slate-400', bg: 'bg-slate-400' },
  alumni: { label: 'Alumni', color: 'text-blue-600', bg: 'bg-blue-500' },
  parachute: { label: 'Parachute', color: 'text-sky-600', bg: 'bg-sky-500' },
  external: { label: 'External', color: 'text-orange-600', bg: 'bg-orange-500' },
  intern: { label: 'Intern', color: 'text-teal-600', bg: 'bg-teal-500' },
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  linkedin: Globe,
  whatsapp: MessageCircle,
  telegram: SendHorizonal,
  email: Mail,
  phone: Phone,
}

function getSocialIcon(platform: string) {
  return socialIcons[platform.toLowerCase()] || AtSign
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarGradient(name: string) {
  const gradients = [
    'from-[var(--esn-blue)] to-[var(--esn-pink)]',
    'from-[var(--esn-green)] to-[var(--esn-blue)]',
    'from-[var(--esn-orange)] to-[var(--esn-pink)]',
    'from-[var(--esn-pink)] to-[var(--esn-dark)]',
    'from-[var(--esn-blue)] to-[var(--esn-green)]',
    'from-[var(--esn-dark)] to-[var(--esn-blue)]',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export function PeopleDirectory({ volunteers }: PeopleDirectoryProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = volunteers.filter((v) => {
    const matchesSearch = !search || v.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeStatuses = [...new Set(volunteers.map(v => v.status))]

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Find someone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-[13px]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="All" count={volunteers.length} />
          {activeStatuses.map((s) => {
            const cfg = statusConfig[s]
            const count = volunteers.filter(v => v.status === s).length
            return (
              <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={cfg.label} count={count} dotColor={cfg.bg} />
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="border rounded-lg divide-y overflow-hidden bg-card">
        {filtered.map((vol) => {
          const status = statusConfig[vol.status] || statusConfig.new_member
          const contacts = Object.entries(vol.contacts || {})
          const locationParts = [vol.nationality, vol.country].filter(Boolean)

          return (
            <Link
              key={vol.id}
              href={`/volunteer/people/${vol.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
            >
              {/* Avatar with status indicator */}
              <div className="relative flex-shrink-0">
                {vol.photo_url ? (
                  <img src={vol.photo_url} alt={vol.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className={cn(
                    'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white',
                    getAvatarGradient(vol.name)
                  )}>
                    {getInitials(vol.name)}
                  </div>
                )}
                <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card', status.bg)} />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold truncate">{vol.name}</span>
                    <span className={cn('text-[10px] font-medium', status.color)}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    {vol.join_semester && (
                      <span className="flex items-center gap-0.5">
                        <GraduationCap className="h-3 w-3" /> {vol.join_semester}
                      </span>
                    )}
                    {locationParts.length > 0 && (
                      <>
                        {vol.join_semester && <span className="text-border">|</span>}
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" /> {locationParts.join(' · ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Social icons */}
              {contacts.length > 0 && (
                <div className="hidden sm:flex gap-1 flex-shrink-0">
                  {contacts.slice(0, 3).map(([platform]) => {
                    const SocialIcon = getSocialIcon(platform)
                    return (
                      <div key={platform} className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center" title={platform}>
                        <SocialIcon className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )
                  })}
                  {contacts.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                      +{contacts.length - 3}
                    </div>
                  )}
                </div>
              )}

              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors flex-shrink-0" />
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-[13px]">No volunteers found</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {filtered.length} member{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function FilterPill({ active, onClick, label, count, dotColor }: {
  active: boolean; onClick: () => void; label: string; count: number; dotColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <span className="flex items-center gap-1.5">
        {dotColor && !active && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
        {label} <span className="opacity-60">{count}</span>
      </span>
    </button>
  )
}
