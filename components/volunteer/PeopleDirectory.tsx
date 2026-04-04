'use client'

import { useState } from 'react'
import { VolunteerStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

const statusConfig: Record<VolunteerStatus, { label: string; emoji: string; color: string }> = {
  new_member: { label: 'New Member', emoji: '🌱', color: 'bg-emerald-100 text-emerald-700' },
  member: { label: 'Member', emoji: '⭐', color: 'bg-amber-100 text-amber-700' },
  board: { label: 'Board', emoji: '👑', color: 'bg-purple-100 text-purple-700' },
  inactive_member: { label: 'Inactive', emoji: '😴', color: 'bg-slate-100 text-slate-600' },
  alumni: { label: 'Alumni', emoji: '🎓', color: 'bg-blue-100 text-blue-700' },
  parachute: { label: 'Parachute', emoji: '🪂', color: 'bg-sky-100 text-sky-700' },
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All ({volunteers.length})
          </button>
          {activeStatuses.map((s) => {
            const cfg = statusConfig[s]
            const count = volunteers.filter(v => v.status === s).length
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  statusFilter === s ? cfg.color : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {cfg.emoji} {cfg.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} volunteer{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vol) => {
          const status = statusConfig[vol.status] || statusConfig.new_member
          const contacts = Object.entries(vol.contacts || {})
          return (
            <Card key={vol.id} className="overflow-hidden hover:border-primary/20 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {vol.photo_url ? (
                    <img
                      src={vol.photo_url}
                      alt={vol.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
                      getAvatarGradient(vol.name)
                    )}>
                      {getInitials(vol.name)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{vol.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', status.color)}>
                        {status.emoji} {status.label}
                      </span>
                      {vol.join_semester && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <GraduationCap className="h-3 w-3" /> {vol.join_semester}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {(vol.nationality || vol.country) && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                      <div className="flex gap-1.5 mt-2">
                        {contacts.slice(0, 4).map(([platform]) => {
                          const SocialIcon = socialIcons[platform.toLowerCase()] || AtSign
                          return (
                            <div key={platform} className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center" title={`${platform}`}>
                              <SocialIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )
                        })}
                        {contacts.length > 4 && (
                          <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
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
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No volunteers found</p>
        </div>
      )}
    </div>
  )
}
