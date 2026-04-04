'use client'

import { useState } from 'react'
import { VolunteerStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Flag, Camera, MessageCircle, Mail, Phone, Globe, AtSign, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const statusConfig: Record<VolunteerStatus, { label: string; color: string; dot: string }> = {
  new_member: { label: 'New Member', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60', dot: 'bg-emerald-500' },
  member: { label: 'Member', color: 'bg-amber-50 text-amber-700 ring-amber-200/60', dot: 'bg-amber-500' },
  board: { label: 'Board', color: 'bg-purple-50 text-purple-700 ring-purple-200/60', dot: 'bg-purple-500' },
  inactive_member: { label: 'Inactive', color: 'bg-slate-50 text-slate-500 ring-slate-200/60', dot: 'bg-slate-400' },
  alumni: { label: 'Alumni', color: 'bg-blue-50 text-blue-700 ring-blue-200/60', dot: 'bg-blue-500' },
  parachute: { label: 'Parachute', color: 'bg-sky-50 text-sky-700 ring-sky-200/60', dot: 'bg-sky-500' },
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  linkedin: Globe,
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
  twitter: AtSign,
  x: AtSign,
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
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <FilterChip
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            label={`All (${volunteers.length})`}
          />
          {activeStatuses.map((s) => {
            const cfg = statusConfig[s]
            const count = volunteers.filter(v => v.status === s).length
            return (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={`${cfg.label} (${count})`}
                dotColor={cfg.dot}
              />
            )
          })}
        </div>
      </div>

      {/* Count */}
      <p className="text-[12px] text-muted-foreground font-medium">
        {filtered.length} volunteer{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vol) => {
          const status = statusConfig[vol.status] || statusConfig.new_member
          const contacts = Object.entries(vol.contacts || {})
          return (
            <Card key={vol.id} className="hover-lift">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  {vol.photo_url ? (
                    <img
                      src={vol.photo_url}
                      alt={vol.name}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={cn(
                      'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0',
                      getAvatarGradient(vol.name)
                    )}>
                      {getInitials(vol.name)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold truncate">{vol.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ring-1', status.color)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                        {status.label}
                      </span>
                      {vol.join_semester && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <GraduationCap className="h-3 w-3" /> {vol.join_semester}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {(vol.nationality || vol.country) && (
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        {vol.nationality && (
                          <span className="flex items-center gap-1"><Flag className="h-3 w-3" /> {vol.nationality}</span>
                        )}
                        {vol.country && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vol.country}</span>
                        )}
                      </div>
                    )}

                    {/* Social links */}
                    {contacts.length > 0 && (
                      <div className="flex gap-1 mt-2.5">
                        {contacts.slice(0, 4).map(([platform]) => {
                          const SocialIcon = socialIcons[platform.toLowerCase()] || AtSign
                          return (
                            <div key={platform} className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center hover:bg-primary/8 hover:text-primary transition-colors" title={platform}>
                              <SocialIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )
                        })}
                        {contacts.length > 4 && (
                          <div className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                            +{contacts.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-[13px]">No volunteers found</p>
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label, dotColor }: {
  active: boolean
  onClick: () => void
  label: string
  dotColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
        active
          ? 'bg-foreground text-background shadow-sm'
          : 'bg-white text-muted-foreground ring-1 ring-border/60 hover:ring-border hover:text-foreground'
      )}
    >
      <span className="flex items-center gap-1.5">
        {dotColor && !active && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
        {label}
      </span>
    </button>
  )
}
