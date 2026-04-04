import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

// Unified badge style — all badges use the same shape
function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium', className)}>
      {children}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-red-50 text-red-700',
    volunteer: 'bg-blue-50 text-blue-700',
    student: 'bg-neutral-100 text-neutral-600',
  }
  const labels: Record<string, string> = { admin: 'Admin', volunteer: 'Volunteer', student: 'Student' }
  return <Tag className={styles[role] || styles.student}>{labels[role] || role}</Tag>
}

export function AccessLevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    public: 'bg-emerald-50 text-emerald-700',
    staff_only: 'bg-blue-50 text-blue-700',
    admin_only: 'bg-red-50 text-red-700',
    custom: 'bg-neutral-100 text-neutral-600',
  }
  const labels: Record<string, string> = { public: 'Public', staff_only: 'Staff Only', admin_only: 'Admin Only', custom: 'Custom' }
  return <Tag className={styles[level] || styles.custom}>{labels[level] || level}</Tag>
}

export function ProjectRoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-purple-50 text-purple-700',
    user: 'bg-neutral-100 text-neutral-600',
  }
  const labels: Record<string, string> = { admin: 'Project Admin', user: 'User' }
  return <Tag className={styles[role] || styles.user}>{labels[role] || role}</Tag>
}

const statusStyles: Record<ProjectStatus, { label: string; dot: string; bg: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700' },
  development: { label: 'Development', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700' },
  inactive: { label: 'Inactive', dot: 'bg-neutral-400', bg: 'bg-neutral-100 text-neutral-500' },
}

export function ProjectStatusBadge({ status, variant = 'inline' }: { status: ProjectStatus; variant?: 'overlay' | 'inline' }) {
  const cfg = statusStyles[status] || statusStyles.active

  if (variant === 'overlay') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm bg-black/40 text-white/90">
        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
        {cfg.label}
      </span>
    )
  }

  return (
    <Tag className={cfg.bg}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </Tag>
  )
}
