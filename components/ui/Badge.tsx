import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-[var(--primary)]/10 text-[var(--primary)]',
  success: 'bg-[var(--accent)]/10 text-[var(--accent)]',
  warning: 'bg-[var(--warning)]/10 text-[var(--warning)]',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-[var(--dark)]/10 text-[var(--dark)]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    admin: { variant: 'danger', label: 'Admin' },
    volunteer: { variant: 'primary', label: 'Volunteer' },
    student: { variant: 'default', label: 'Student' },
  }
  const { variant, label } = config[role] || { variant: 'default' as BadgeVariant, label: role }
  return <Badge variant={variant}>{label}</Badge>
}

export function AccessLevelBadge({ level }: { level: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    public: { variant: 'success', label: 'Public' },
    staff_only: { variant: 'primary', label: 'Staff Only' },
    admin_only: { variant: 'danger', label: 'Admin Only' },
    custom: { variant: 'warning', label: 'Custom' },
  }
  const { variant, label } = config[level] || { variant: 'default' as BadgeVariant, label: level }
  return <Badge variant={variant}>{label}</Badge>
}

export function ProjectRoleBadge({ role }: { role: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    admin: { variant: 'warning', label: 'Project Admin' },
    user: { variant: 'default', label: 'User' },
  }
  const { variant, label } = config[role] || { variant: 'default' as BadgeVariant, label: role }
  return <Badge variant={variant}>{label}</Badge>
}
