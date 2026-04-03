'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { VolunteerStatus } from '@/types'
import { COUNTRIES, NATIONALITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  ArrowRight, ArrowLeft, Sparkles, User, Calendar, Link as LinkIcon,
  Check, PartyPopper, Camera, Globe, Plus, X, MessageCircle, Cake, Flag, Loader2,
} from 'lucide-react'

const TOTAL_STEPS = 5

const statusOptions: { value: VolunteerStatus; label: string; emoji: string; desc: string }[] = [
  { value: 'new_member', label: 'New Member', emoji: '🌱', desc: 'Just joined ESN' },
  { value: 'member', label: 'Member', emoji: '⭐', desc: 'Active volunteer' },
  { value: 'board', label: 'Board', emoji: '👑', desc: 'Board member' },
  { value: 'inactive_member', label: 'Inactive', emoji: '😴', desc: 'Taking a break' },
  { value: 'alumni', label: 'Alumni', emoji: '🎓', desc: 'Former volunteer' },
  { value: 'parachute', label: 'Parachute', emoji: '🪂', desc: 'From another section' },
]

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

const socialPlatforms = [
  { key: 'instagram', label: 'Instagram', icon: Camera, placeholder: '@username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Globe, placeholder: 'linkedin.com/in/...' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '+351 ...' },
]

interface OnboardingWizardProps {
  authEmail: string
  existingName?: string | null
}

export function OnboardingWizard({ authEmail, existingName }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(existingName || '')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState<string | null>(null)
  const [nationality, setNationality] = useState('')
  const [country, setCountry] = useState('Portugal')
  const [status, setStatus] = useState<VolunteerStatus>('new_member')
  const [joinSemester, setJoinSemester] = useState(generateSemesters()[0])
  const [contacts, setContacts] = useState<Record<string, string>>({})
  const [customKey, setCustomKey] = useState('')
  const [customVal, setCustomVal] = useState('')

  function next() { if (step < TOTAL_STEPS) setStep(step + 1) }
  function prev() { if (step > 1) setStep(step - 1) }
  function removeContact(k: string) { const { [k]: _, ...rest } = contacts; setContacts(rest) }
  function addCustom() { if (customKey && customVal) { setContacts({ ...contacts, [customKey]: customVal }); setCustomKey(''); setCustomVal('') } }

  async function handleFinish() {
    setSaving(true)
    await fetch('/api/volunteer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, phone: phone || null, status, join_semester: joinSemester,
        birthdate, nationality: nationality || null, country: country || null, contacts,
      }),
    })
    setSaving(false)
    next()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-96 h-96 bg-[var(--esn-blue)]/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-96 h-96 bg-[var(--esn-pink)]/8 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[var(--esn-green)]/5 rounded-full blur-3xl" />

      {/* Progress */}
      {step < TOTAL_STEPS && (
        <div className="flex items-center gap-2 mb-8 z-10">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div key={i} className={cn(
              'h-2 rounded-full transition-all duration-300',
              i + 1 === step ? 'w-8 bg-primary' : i + 1 < step ? 'w-2 bg-primary/60' : 'w-2 bg-muted'
            )} />
          ))}
        </div>
      )}

      <div className="w-full max-w-md z-10">

        {/* ===== Step 1: Welcome ===== */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-[var(--esn-blue)]/20">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Welcome to ESN Porto!</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Let&apos;s set up your volunteer profile in a few quick steps.
              </p>
            </div>
            <Button size="lg" onClick={next} className="gradient-primary border-0 text-white px-8 h-12 text-base">
              Let&apos;s go <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ===== Step 2: About You ===== */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">About you</h2>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <div className="h-10 flex items-center px-3 rounded-lg border bg-muted/50 text-sm text-muted-foreground">{authEmail}</div>
                </div>

                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <PhoneInput
                    defaultCountry="pt" value={phone} onChange={setPhone}
                    inputClassName="!h-10 !rounded-lg !border-input !bg-card !text-sm !w-full"
                    countrySelectorStyleProps={{ buttonClassName: '!h-10 !rounded-lg !rounded-r-none !border-input !bg-card !px-2' }}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Cake className="h-3.5 w-3.5" /> Birthday</Label>
                  <DatePicker value={birthdate} onChange={setBirthdate} placeholder="Select your birthday" maxDate={new Date()} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> Nationality</Label>
                    <SearchableSelect value={nationality} onChange={setNationality} options={NATIONALITIES} placeholder="Select..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Country</Label>
                    <SearchableSelect value={country} onChange={setCountry} options={COUNTRIES} placeholder="Select..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={next} disabled={!name.trim()}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* ===== Step 3: Membership ===== */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--esn-green)]/10 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-[var(--esn-green)]" />
              </div>
              <h2 className="text-xl font-bold">Your ESN journey</h2>
              <p className="text-sm text-muted-foreground mt-1">What&apos;s your volunteer status?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((o) => (
                <button key={o.value} onClick={() => setStatus(o.value)} className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]',
                  status === o.value ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border hover:border-muted-foreground/30'
                )}>
                  <span className="text-2xl block mb-1">{o.emoji}</span>
                  <span className="font-semibold text-sm block">{o.label}</span>
                  <span className="text-xs text-muted-foreground">{o.desc}</span>
                </button>
              ))}
            </div>

            <Card>
              <CardContent className="pt-5">
                <Label>When did you join ESN?</Label>
                <SearchableSelect
                  value={joinSemester}
                  onChange={setJoinSemester}
                  options={generateSemesters()}
                  placeholder="Select semester..."
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={next}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* ===== Step 4: Contacts ===== */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--esn-orange)]/10 flex items-center justify-center mb-3">
                <LinkIcon className="h-6 w-6 text-[var(--esn-orange)]" />
              </div>
              <h2 className="text-xl font-bold">Stay connected</h2>
              <p className="text-sm text-muted-foreground mt-1">Add your social links (optional)</p>
            </div>

            <div className="space-y-3">
              {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => {
                const added = contacts[key] !== undefined
                return added ? (
                  <Card key={key}><CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <Label className="text-xs">{label}</Label>
                        <Input placeholder={placeholder} value={contacts[key]}
                          onChange={(e) => setContacts({ ...contacts, [key]: e.target.value })} className="mt-1" />
                      </div>
                      <Button variant="ghost" size="icon-xs" onClick={() => removeContact(key)}><X className="h-3 w-3" /></Button>
                    </div>
                  </CardContent></Card>
                ) : (
                  <button key={key} onClick={() => setContacts({ ...contacts, [key]: '' })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed hover:border-primary/40 hover:bg-primary/5 transition-colors text-left">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Add {label}</span>
                    <Plus className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                )
              })}

              {Object.entries(contacts).filter(([k]) => !socialPlatforms.some((p) => p.key === k)).map(([k, v]) => (
                <Card key={k}><CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{k}</Badge>
                    <span className="text-sm flex-1 truncate">{v}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeContact(k)}><X className="h-3 w-3" /></Button>
                  </div>
                </CardContent></Card>
              ))}

              <div className="flex gap-2">
                <Input placeholder="Platform" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="flex-1" />
                <Input placeholder="Username / link" value={customVal} onChange={(e) => setCustomVal(e.target.value)} className="flex-1" />
                <Button variant="outline" size="sm" onClick={addCustom} disabled={!customKey || !customVal}>Add</Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {saving ? 'Saving...' : 'Finish'} {!saving && <Check className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        )}

        {/* ===== Step 5: Done ===== */}
        {step === 5 && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-[var(--esn-blue)]/30">
              <PartyPopper className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">You&apos;re all set, {name.split(' ')[0]}!</h1>
              <p className="text-muted-foreground mt-2">Your volunteer profile is ready. Welcome to the team!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" onClick={() => router.push('/volunteer/apps')} className="gradient-primary border-0 text-white h-12">
                View My Apps <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/volunteer/profile?from=onboarding')} className="h-12">
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
