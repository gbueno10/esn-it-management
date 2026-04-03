'use client'

import { useState } from 'react'
import { Volunteer, VolunteerStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, User, Phone, Mail, Calendar, Link as LinkIcon } from 'lucide-react'

const statusOptions: { value: VolunteerStatus; label: string }[] = [
  { value: 'new_member', label: 'New Member' },
  { value: 'member', label: 'Member' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'parachute', label: 'Parachute' },
]

interface VolunteerProfileProps {
  volunteer: Volunteer
  authEmail: string
}

export function VolunteerProfile({ volunteer, authEmail }: VolunteerProfileProps) {
  const [form, setForm] = useState({
    name: volunteer.name || '',
    phone: volunteer.phone || '',
    status: volunteer.status || 'new_member',
    join_semester: volunteer.join_semester || '',
    contacts: volunteer.contacts || {},
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [contactKey, setContactKey] = useState('')
  const [contactValue, setContactValue] = useState('')

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/volunteer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  function addContact() {
    if (contactKey && contactValue) {
      setForm({ ...form, contacts: { ...form.contacts, [contactKey]: contactValue } })
      setContactKey('')
      setContactValue('')
    }
  }

  function removeContact(key: string) {
    const { [key]: _, ...rest } = form.contacts
    setForm({ ...form, contacts: rest })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {authEmail}
            </div>
            <p className="text-xs text-muted-foreground">Email is managed through your account settings</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Input
                id="phone"
                placeholder="+351 912 345 678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Membership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as VolunteerStatus })}
              className="w-full h-8 rounded-lg border px-2.5 text-sm bg-card"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="semester">Join Semester</Label>
            <Input
              id="semester"
              placeholder="e.g. 2025/2026 S1"
              value={form.join_semester}
              onChange={(e) => setForm({ ...form, join_semester: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Contacts & Social
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(form.contacts).length > 0 && (
            <div className="space-y-2">
              {Object.entries(form.contacts).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline">{key}</Badge>
                  <span className="text-sm flex-1 truncate">{value}</span>
                  <Button variant="ghost" size="icon-xs" onClick={() => removeContact(key)}>
                    <span className="text-xs">x</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Platform (e.g. instagram)"
              value={contactKey}
              onChange={(e) => setContactKey(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Username or link"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addContact} disabled={!contactKey || !contactValue}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  )
}
