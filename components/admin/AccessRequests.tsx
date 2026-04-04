'use client'

import { useState } from 'react'
import { AccessRequestWithDetails } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Check, X, Inbox, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatRelativeTime } from '@/lib/utils'

interface AccessRequestsProps {
  initialRequests: AccessRequestWithDetails[]
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
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export function AccessRequests({ initialRequests }: AccessRequestsProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    setProcessing(id)
    const res = await fetch(`/api/admin/access-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setProcessing(null)

    if (res.ok) {
      setRequests(requests.filter(r => r.id !== id))
      toast.success(status === 'approved' ? 'Access granted!' : 'Request rejected')
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Failed' }))
      toast.error(error)
    }
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        description="All access requests have been reviewed."
        icon={<Inbox className="h-8 w-8" />}
      />
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => {
            const isProcessing = processing === req.id
            const displayName = req.user_name || req.user_email || 'Unknown'
            return (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {req.user_photo ? (
                      <img src={req.user_photo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className={cn(
                        'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white',
                        getAvatarGradient(displayName)
                      )}>
                        {getInitials(displayName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{req.user_name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground truncate">{req.user_email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium text-sm">{req.project_name}</span>
                    {req.requested_role === 'admin' && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        Admin
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {req.message || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(req.created_at)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(req.id, 'rejected')}
                      disabled={isProcessing}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReview(req.id, 'approved')}
                      disabled={isProcessing}
                      className="h-7 text-xs"
                    >
                      {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                      Approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
