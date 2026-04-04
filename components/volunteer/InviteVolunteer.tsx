'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { UserPlus, Copy, Check, Link as LinkIcon } from 'lucide-react'
import { VolunteerStatus } from '@/types'

const statusOptions: { value: VolunteerStatus; label: string }[] = [
  { value: 'new_member', label: 'New Member' },
  { value: 'member', label: 'Member' },
  { value: 'board', label: 'Board' },
  { value: 'parachute', label: 'Parachute' },
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

export function InviteVolunteer() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [semester, setSemester] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams({ role: 'volunteer' })
  if (status) params.set('status', status)
  if (semester) params.set('semester', semester)
  const inviteUrl = `${baseUrl}/login?${params.toString()}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button size="sm">
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite
        </Button>
      } />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Invite Volunteer</SheetTitle>
          <SheetDescription>
            Pre-fill membership details and share the signup link.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VolunteerStatus)}
                className="w-full h-10 rounded-md border border-input bg-card px-3 text-[13px] outline-none hover:border-foreground/20 focus-visible:border-foreground/30"
              >
                <option value="">None</option>
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Join Semester</Label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-card px-3 text-[13px] outline-none hover:border-foreground/20 focus-visible:border-foreground/30"
              >
                <option value="">None</option>
                {generateSemesters().map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] flex items-center gap-1">
              <LinkIcon className="h-3 w-3" /> Signup Link
            </Label>
            <div className="bg-muted rounded-md px-3 py-2 text-[12px] font-mono break-all select-all">
              {inviteUrl}
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy} className="w-full mt-2">
              {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            The volunteer will create their account with these fields pre-filled.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
