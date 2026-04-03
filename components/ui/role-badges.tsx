import { Badge } from '@/components/ui/badge'

export function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    admin: { variant: 'destructive', label: 'Admin' },
    volunteer: { variant: 'default', label: 'Volunteer' },
    student: { variant: 'secondary', label: 'Student' },
  }
  const { variant, label } = config[role] || { variant: 'secondary' as const, label: role }
  return <Badge variant={variant}>{label}</Badge>
}

export function AccessLevelBadge({ level }: { level: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    public: { variant: 'default', label: 'Public' },
    staff_only: { variant: 'outline', label: 'Staff Only' },
    admin_only: { variant: 'destructive', label: 'Admin Only' },
    custom: { variant: 'secondary', label: 'Custom' },
  }
  const { variant, label } = config[level] || { variant: 'secondary' as const, label: level }
  return <Badge variant={variant}>{label}</Badge>
}

export function ProjectRoleBadge({ role }: { role: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    admin: { variant: 'destructive', label: 'Project Admin' },
    user: { variant: 'secondary', label: 'User' },
  }
  const { variant, label } = config[role] || { variant: 'secondary' as const, label: role }
  return <Badge variant={variant}>{label}</Badge>
}
