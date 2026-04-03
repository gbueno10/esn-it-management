'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface GlobalAdminsProps {
  admins: AdminUser[]
  isAdmin: boolean
}

export function GlobalAdmins({ admins, isAdmin }: GlobalAdminsProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card className="mb-6 border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base">Global Admins</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {admins.length} admin{admins.length !== 1 ? 's' : ''} with full system access
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-sm font-bold text-destructive flex-shrink-0">
                  {(admin.name || admin.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{admin.name || 'No name'}</p>
                  <p className="text-xs text-muted-foreground truncate">{admin.email || 'No email'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Admin</Badge>
                  {isAdmin && (
                    <Link href={`/users/${admin.id}`}>
                      <Button variant="ghost" size="icon-xs">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          {admins.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No global admins found</p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
