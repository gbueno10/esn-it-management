'use client'

import { useState } from 'react'
import { Volunteer, VolunteerStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Separator } from '@/components/ui/separator'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { COUNTRIES, NATIONALITIES, SOCIAL_PLATFORMS, getSocialUrl } from '@/lib/constants'
import {
  Save, User, Mail, Calendar, Link as LinkIcon, Plus, X, Cake, Flag, Globe,
  Loader2, Pencil, Phone, MapPin, GraduationCap, Camera, ExternalLink,
  MessageCircle, AtSign, Sparkles, SendHorizonal, Home,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Constants ──────────────────────────────────────────────

const statusConfig: Record<VolunteerStatus, { label: string; emoji: string; color: string; dot: string; bg: string }> = {
  new_member: { label: 'New Member', emoji: '🌱', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-500' },
  member: { label: 'Member', emoji: '⭐', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-500' },
  board: { label: 'Board', emoji: '👑', color: 'text-purple-600', dot: 'bg-purple-500', bg: 'bg-purple-500' },
  inactive_member: { label: 'Inactive', emoji: '😴', color: 'text-slate-400', dot: 'bg-slate-400', bg: 'bg-slate-400' },
  alumni: { label: 'Alumni', emoji: '🎓', color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-500' },
  parachute: { label: 'Parachute', emoji: '🪂', color: 'text-sky-600', dot: 'bg-sky-500', bg: 'bg-sky-500' },
  external: { label: 'External', emoji: '🌍', color: 'text-orange-600', dot: 'bg-orange-500', bg: 'bg-orange-500' },
  intern: { label: 'Intern', emoji: '📋', color: 'text-teal-600', dot: 'bg-teal-500', bg: 'bg-teal-500' },
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

function generateSemesters(): string[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const semesters: string[] = []
  const startYear = month >= 8 ? year : year - 1
  for (let i = 0; i < 8; i++) {
    const y = startYear - Math.floor(i / 2)
    const sem = i % 2 === 0 ? 'S1' : 'S2'
    semesters.push(`${y}/${y + 1} ${sem}`)
  }
  return semesters
}

function formatBirthdate(date: string | null) {
  if (!date) return null
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getFirstName(name: string) {
  return name.split(' ')[0]
}

// Deterministic gradient from name
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

// ── Component ──────────────────────────────────────────────

interface VolunteerProfileProps {
  volunteer: Volunteer
  authEmail: string
}

export function VolunteerProfile({ volunteer, authEmail }: VolunteerProfileProps) {
  const [editing, setEditing] = useState(!volunteer.name)
  const [photoUrl, setPhotoUrl] = useState<string | null>(volunteer.photo_url)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [form, setForm] = useState({
    name: volunteer.name || '',
    phone: volunteer.phone || '',
    birthdate: volunteer.birthdate || null as string | null,
    nationality: volunteer.nationality || '',
    country: volunteer.country || 'Portugal',
    address: volunteer.address || '',
    status: volunteer.status || ('new_member' as VolunteerStatus),
    join_semester: volunteer.join_semester || generateSemesters()[0],
    contacts: volunteer.contacts || {} as Record<string, string>,
  })
  const [saving, setSaving] = useState(false)
  const [contactKey, setContactKey] = useState('')
  const [contactValue, setContactValue] = useState('')

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/volunteer/avatar', { method: 'POST', body: formData })
    setUploadingPhoto(false)
    if (res.ok) {
      const { photo_url } = await res.json()
      setPhotoUrl(photo_url + '?t=' + Date.now())
      toast.success('Photo updated!')
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
      toast.error(error)
    }
    e.target.value = ''
  }

  async function handlePhotoRemove() {
    setUploadingPhoto(true)
    const res = await fetch('/api/volunteer/avatar', { method: 'DELETE' })
    setUploadingPhoto(false)
    if (res.ok) {
      setPhotoUrl(null)
      toast.success('Photo removed')
    }
  }

  const status = statusConfig[form.status] || statusConfig.new_member

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const res = await fetch('/api/volunteer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        phone: form.phone || null,
        nationality: form.nationality || null,
        country: form.country || null,
        address: form.address || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Profile saved!')
      setEditing(false)
    } else {
      toast.error('Failed to save. Please try again.')
    }
  }

  function addContact() {
    if (contactKey && contactValue) {
      setForm({ ...form, contacts: { ...form.contacts, [contactKey]: contactValue } })
      setContactKey(''); setContactValue('')
    }
  }
  function removeContact(key: string) {
    const { [key]: _, ...rest } = form.contacts
    setForm({ ...form, contacts: rest })
  }

  // =====================================================
  // VIEW MODE — the beautiful profile card
  // =====================================================
  if (!editing) {
    const hasDetails = form.phone || form.birthdate || form.nationality || form.country
    const hasContacts = Object.keys(form.contacts).length > 0
    const completionItems = [photoUrl, form.phone, form.birthdate, form.nationality, form.country, hasContacts]
    const completionPct = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)

    const details = [
      form.phone && { icon: Phone, label: 'Phone', value: form.phone },
      form.birthdate && { icon: Cake, label: 'Birthday', value: formatBirthdate(form.birthdate)! },
      form.nationality && { icon: Flag, label: 'Nationality', value: form.nationality },
      form.country && { icon: MapPin, label: 'Lives in', value: form.country },
      form.address && { icon: Home, label: 'Address', value: form.address },
    ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[]

    return (
      <div className="max-w-lg mx-auto animate-fade-in-up">
        {/* Profile header - Slack style */}
        <div className="flex flex-col items-center text-center mb-8">
          <label className="relative group cursor-pointer mb-4">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            {photoUrl ? (
              <img src={photoUrl} alt={form.name || 'Avatar'} className="w-20 h-20 rounded-full object-cover ring-4 ring-background shadow-lg" />
            ) : (
              <div className={cn(
                'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl font-bold text-white ring-4 ring-background shadow-lg',
                getAvatarGradient(form.name || 'V')
              )}>
                {form.name ? getInitials(form.name) : '?'}
              </div>
            )}
            <span className={cn('absolute bottom-0 right-0 w-5 h-5 rounded-full border-[3px] border-background', status.bg)} />
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              {uploadingPhoto ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </label>

          <h1 className="text-xl font-bold tracking-tight">{form.name || 'New Volunteer'}</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">{authEmail}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('text-[12px] font-medium', status.color)}>{status.label}</span>
            {form.join_semester && (
              <>
                <span className="text-border">·</span>
                <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> {form.join_semester}
                </span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="mt-4 text-[12px]">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Profile
          </Button>
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
        {hasContacts && (
          <div className="mb-6">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contacts</h3>
            <div className="border rounded-lg divide-y bg-card">
              {Object.entries(form.contacts).map(([platform, handle]) => {
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

        {/* Completion nudge */}
        {completionPct < 100 && (
          <div className="border rounded-lg bg-card p-4 flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium">Complete your profile</p>
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="flex-shrink-0 text-[12px]">
              Complete
            </Button>
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // EDIT MODE — clean form
  // =====================================================
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in-up">
      {/* Header with avatar preview */}
      <div className="flex items-center gap-4">
        <label className="relative group cursor-pointer flex-shrink-0">
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={form.name || 'Avatar'}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className={cn(
              'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg font-bold text-white',
              getAvatarGradient(form.name || 'V')
            )}>
              {form.name ? getInitials(form.name) : '?'}
            </div>
          )}
          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            {uploadingPhoto ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </label>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight">
            {form.name ? `Editing ${getFirstName(form.name)}'s profile` : 'Set up your profile'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {volunteer.name ? 'Make changes to your volunteer profile' : 'Tell us a bit about yourself'}
          </p>
        </div>
        {volunteer.name && (
          <Button variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription className="text-xs">Your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus={!volunteer.name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2.5 h-10 px-3 rounded-lg border bg-muted/40 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{authEmail}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <PhoneInput defaultCountry="pt" value={form.phone} onChange={(phone) => setForm({ ...form, phone })}
              inputClassName="!h-10 !rounded-lg !border-input !bg-card !text-sm !w-full"
              countrySelectorStyleProps={{ buttonClassName: '!h-10 !rounded-lg !rounded-r-none !border-input !bg-card !px-2' }}
              className="w-full" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Cake className="h-3.5 w-3.5" /> Birthday</Label>
            <DatePicker value={form.birthdate} onChange={(d) => setForm({ ...form, birthdate: d })} placeholder="Select your birthday" maxDate={new Date()} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> Nationality</Label>
              <SearchableSelect value={form.nationality} onChange={(v) => setForm({ ...form, nationality: v })} options={NATIONALITIES} placeholder="Select..." />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Country</Label>
              <SearchableSelect value={form.country} onChange={(v) => setForm({ ...form, country: v })} options={COUNTRIES} placeholder="Select..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" /> Address</Label>
            <Input placeholder="Your address (only visible to admins)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <p className="text-[11px] text-muted-foreground">Only admins can see your full address.</p>
          </div>
        </CardContent>
      </Card>

      {/* Membership */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--esn-green)]/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-[var(--esn-green)]" />
            </div>
            <div>
              <CardTitle className="text-base">Membership</CardTitle>
              <CardDescription className="text-xs">Your ESN status and journey</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <SearchableSelect
              value={`${statusConfig[form.status].emoji} ${statusConfig[form.status].label}`}
              onChange={(label) => {
                const entry = Object.entries(statusConfig).find(([, v]) => `${v.emoji} ${v.label}` === label)
                if (entry) setForm({ ...form, status: entry[0] as VolunteerStatus })
              }}
              options={Object.entries(statusConfig).map(([, v]) => `${v.emoji} ${v.label}`)}
              placeholder="Select status..."
            />
          </div>
          <div className="space-y-2">
            <Label>Join Semester</Label>
            <SearchableSelect value={form.join_semester} onChange={(v) => setForm({ ...form, join_semester: v })} options={generateSemesters()} placeholder="Select semester..." />
          </div>
        </CardContent>
      </Card>

      {/* Contacts & Social */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--esn-orange)]/10 flex items-center justify-center">
              <LinkIcon className="h-4 w-4 text-[var(--esn-orange)]" />
            </div>
            <div>
              <CardTitle className="text-base">Social Links</CardTitle>
              <CardDescription className="text-xs">How can other volunteers find you?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(form.contacts).length > 0 && (
            <div className="space-y-2">
              {Object.entries(form.contacts).map(([key, value]) => {
                const Icon = getSocialIcon(key)
                return (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 group transition-colors hover:bg-muted/60">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className="text-sm text-muted-foreground flex-1 truncate">{value}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeContact(key)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex gap-2">
            <SearchableSelect
              value={contactKey ? SOCIAL_PLATFORMS.find(p => p.key === contactKey)?.label || '' : ''}
              onChange={(label) => {
                const p = SOCIAL_PLATFORMS.find(s => s.label === label)
                if (p) setContactKey(p.key)
              }}
              options={SOCIAL_PLATFORMS.filter(p => !form.contacts[p.key]).map(p => p.label)}
              placeholder="Platform..."
            />
            <Input
              placeholder={SOCIAL_PLATFORMS.find(p => p.key === contactKey)?.placeholder || 'Username or link'}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={addContact} disabled={!contactKey || !contactValue}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10">
        <Card className="shadow-lg border-0 ring-1 ring-black/10">
          <CardContent className="py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {volunteer.name ? 'Unsaved changes' : 'Fill in your details to get started'}
            </p>
            <div className="flex items-center gap-2">
              {volunteer.name && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              )}
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacer for sticky bar */}
      <div className="h-4" />
    </div>
  )
}

// ── Helper components ──────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
