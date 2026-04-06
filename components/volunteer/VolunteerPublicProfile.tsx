'use client'

import { VolunteerStatus } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Phone, Cake, Flag, MapPin, GraduationCap, Camera, Globe,
  MessageCircle, AtSign, ExternalLink, ArrowLeft, Mail, Home, SendHorizonal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSocialUrl } from '@/lib/constants'
import Link from 'next/link'

interface VolunteerData {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  photo_url: string | null
  status: VolunteerStatus
  join_semester: string | null
  birthdate: string | null
  nationality: string | null
  country: string | null
  address: string | null
  contacts: Record<string, string>
}

interface Props {
  volunteer: VolunteerData
  isAdmin: boolean
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

function formatBirthdate(date: string | null) {
  if (!date) return null
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function VolunteerPublicProfile({ volunteer, isAdmin }: Props) {
  const name = volunteer.name || 'Volunteer'
  const status = statusConfig[volunteer.status] || statusConfig.new_member
  const contacts = Object.entries(volunteer.contacts || {})

  const details = [
    volunteer.phone && { icon: Phone, label: 'Phone', value: volunteer.phone },
    volunteer.birthdate && { icon: Cake, label: 'Birthday', value: formatBirthdate(volunteer.birthdate)! },
    volunteer.nationality && { icon: Flag, label: 'Nationality', value: volunteer.nationality },
    volunteer.country && { icon: MapPin, label: 'Lives in', value: volunteer.country },
    isAdmin && volunteer.address && { icon: Home, label: 'Address', value: volunteer.address },
    isAdmin && volunteer.email && { icon: Mail, label: 'Email', value: volunteer.email },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[]

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      {/* Back */}
      <Link href="/volunteer/people">
        <Button variant="ghost" size="sm" className="text-[12px] -ml-2 mb-6">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> People
        </Button>
      </Link>

      {/* Profile header - Slack style */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          {volunteer.photo_url ? (
            <img src={volunteer.photo_url} alt={name} className="w-20 h-20 rounded-full object-cover ring-4 ring-background shadow-lg" />
          ) : (
            <div className={cn(
              'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl font-bold text-white ring-4 ring-background shadow-lg',
              getAvatarGradient(name)
            )}>
              {getInitials(name)}
            </div>
          )}
          <span className={cn('absolute bottom-0 right-0 w-5 h-5 rounded-full border-[3px] border-background', status.bg)} />
        </div>

        <h1 className="text-xl font-bold tracking-tight">{name}</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn('text-[12px] font-medium', status.color)}>{status.label}</span>
          {volunteer.join_semester && (
            <>
              <span className="text-border">·</span>
              <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> {volunteer.join_semester}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Details section */}
      {details.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h3>
          <div className="border rounded-lg divide-y bg-card">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-[12px] text-muted-foreground w-20 flex-shrink-0">{label}</span>
                <span className="text-[13px] font-medium truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts section */}
      {contacts.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contacts</h3>
          <div className="border rounded-lg divide-y bg-card">
            {contacts.map(([platform, handle]) => {
              const Icon = getSocialIcon(platform)
              const url = getSocialUrl(platform, handle)
              return (
                <div key={platform} className="flex items-center gap-3 px-4 py-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-[12px] text-muted-foreground w-20 flex-shrink-0 capitalize">{platform}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-primary hover:underline flex items-center gap-1 truncate">
                      {handle} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-[13px] font-medium truncate">{handle}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
