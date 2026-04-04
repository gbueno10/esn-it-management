'use client'

import { cn } from '@/lib/utils'

interface Body {
  id: string
  name: string
  sort_order: number
}

interface Membership {
  id: string
  member_id: string
  department_id: string
  role: string
  position: string | null
  members: { name: string } | null
}

const boardOrder = [
  'President', 'Vice-President', 'Treasurer', 'Events Manager', 'Marketing Manager',
]

const supportOrder = [
  'Secretary', 'Internship Recruiter', 'Education Officer', 'External Relations Officer',
  'Network Officer', 'Office Team', 'Safety & Inclusion Officer',
]

export function BoardDisplay({ bodies, memberships }: {
  bodies: Body[]
  memberships: Membership[]
}) {
  const board = bodies.find(b => b.name === 'Board')
  const audit = bodies.find(b => b.name === 'Audit Team')
  const chairing = bodies.find(b => b.name === 'Chairing Team')

  const boardMembers = memberships.filter(m => m.department_id === board?.id)
  const mainBoard = boardMembers
    .filter(m => m.role === 'manager')
    .sort((a, b) => boardOrder.indexOf(a.position || '') - boardOrder.indexOf(b.position || ''))
  const support = boardMembers
    .filter(m => m.role === 'member')
    .sort((a, b) => supportOrder.indexOf(a.position || '') - supportOrder.indexOf(b.position || ''))

  // Deduplicate support by position (e.g. Office Team has 2 people)
  const supportByPosition: Record<string, Membership[]> = {}
  for (const m of support) {
    const pos = m.position || 'Unknown'
    if (!supportByPosition[pos]) supportByPosition[pos] = []
    supportByPosition[pos].push(m)
  }

  const auditMembers = memberships.filter(m => m.department_id === audit?.id)
  const chairingMembers = memberships.filter(m => m.department_id === chairing?.id)

  return (
    <div className="overflow-x-auto pb-8">
      <div className="min-w-[700px] space-y-8">

        {/* ===== STATUTORY BODIES header ===== */}
        <div className="flex justify-center">
          <OrgHeader label="Statutory Bodies" color="bg-blue-500" />
        </div>

        {/* Connector down */}
        <ConnectorVertical />

        {/* ===== BOARD ===== */}
        <div>
          <div className="flex justify-center mb-4">
            <OrgHeader label="Board" color="bg-red-400" />
          </div>

          {/* Main board positions */}
          <div className="relative flex justify-center gap-3 mb-2">
            {/* Horizontal line connecting all */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border" style={{ width: `${Math.max(0, (mainBoard.length - 1) * 140)}px` }} />
            {mainBoard.map((m) => (
              <div key={m.id} className="relative flex flex-col items-center">
                <div className="w-px h-4 bg-border" />
                <OrgCard name={m.members?.name || '-'} position={m.position || ''} highlight />
              </div>
            ))}
          </div>
        </div>

        {/* ===== SUPPORT POSITIONS ===== */}
        <div>
          <div className="flex justify-center mb-4">
            <OrgHeader label="Support Positions" color="bg-pink-400" />
          </div>
          <div className="relative flex justify-center gap-3 flex-wrap">
            {Object.entries(supportByPosition).map(([position, members]) => (
              <div key={position} className="flex flex-col items-center">
                <OrgCard
                  name={members.map(m => m.members?.name || '-').join(', ')}
                  position={position}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===== AUDIT + CHAIRING side by side ===== */}
        <div className="grid grid-cols-2 gap-8 mt-4">
          {/* Audit Team */}
          <div>
            <div className="flex justify-center mb-4">
              <OrgHeader label="Audit Team" color="bg-green-500" />
            </div>
            <div className="flex justify-center gap-3">
              {auditMembers.length > 0 ? auditMembers.map((m) => (
                <div key={m.id} className="relative flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <OrgCard name={m.members?.name || '-'} position={m.position || ''} />
                </div>
              )) : (
                <>
                  <OrgCardEmpty position="President of the AT" />
                  <OrgCardEmpty position="Vice-President of the AT" />
                  <OrgCardEmpty position="Reporter" />
                </>
              )}
            </div>
          </div>

          {/* Chairing Team */}
          <div>
            <div className="flex justify-center mb-4">
              <OrgHeader label="Chairing Team" color="bg-orange-400" />
            </div>
            <div className="flex justify-center gap-3">
              {chairingMembers.map((m) => (
                <div key={m.id} className="relative flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <OrgCard name={m.members?.name || '-'} position={m.position || ''} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrgHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className={cn('px-5 py-2 rounded-lg text-white font-semibold text-[13px] text-center shadow-sm', color)}>
      {label}
    </div>
  )
}

function OrgCard({ name, position, highlight }: { name: string; position: string; highlight?: boolean }) {
  return (
    <div className={cn(
      'w-[130px] rounded-lg border px-3 py-2.5 text-center bg-card shadow-sm',
      highlight && 'ring-1 ring-blue-200'
    )}>
      <p className="text-[10px] font-medium text-muted-foreground mb-1 leading-tight">{position}</p>
      <p className={cn('text-[12px] font-semibold leading-tight', name === '-' && 'text-muted-foreground/40')}>
        {name}
      </p>
    </div>
  )
}

function OrgCardEmpty({ position }: { position: string }) {
  return (
    <div className="w-[130px] rounded-lg border border-dashed px-3 py-2.5 text-center bg-muted/20">
      <p className="text-[10px] font-medium text-muted-foreground mb-1 leading-tight">{position}</p>
      <p className="text-[12px] font-semibold text-muted-foreground/30">-</p>
    </div>
  )
}

function ConnectorVertical() {
  return <div className="w-px h-6 bg-border mx-auto" />
}
