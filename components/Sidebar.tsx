'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { LayoutDashboard, FolderKanban, Users, LogOut, Menu, X, User, AppWindow, UsersRound, Building2, Shield, CalendarDays } from 'lucide-react'

interface SidebarProps {
  userEmail: string
  isAdmin: boolean
  userRole: string
}

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/users', label: 'Users', icon: Users },
]

const organizationNav = [
  { href: '/organization/members', label: 'Members', icon: UsersRound },
  { href: '/organization/departments', label: 'Departments', icon: Building2 },
  { href: '/organization/board', label: 'Statutory Bodies', icon: Shield },
  { href: '/events/analytics', label: 'Events', icon: CalendarDays },
]

const volunteerNav = [
  { href: '/volunteer/profile', label: 'My Profile', icon: User },
  { href: '/volunteer/apps', label: 'My Apps', icon: AppWindow },
  { href: '/volunteer/people', label: 'People', icon: Users },
]

export function Sidebar({ userEmail, isAdmin, userRole }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 w-9 h-9 rounded-lg bg-white border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-60 flex flex-col border-r bg-[var(--sidebar)] transition-transform duration-200',
          'lg:translate-x-0 lg:sticky lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">E</span>
            </div>
            <span className="text-[13px] font-semibold text-[var(--sidebar-foreground)]">IT Management</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--sidebar-accent)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-1 space-y-4 overflow-y-auto">
          {isAdmin && (
            <NavSection label="Admin">
              {adminNav.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={pathname === item.href || pathname.startsWith(item.href + '/')}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </NavSection>
          )}

          <NavSection label="ESN Porto">
            {organizationNav.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={pathname === item.href || pathname.startsWith(item.href + '/')}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </NavSection>

          <NavSection label={isAdmin ? 'Volunteer' : 'Menu'}>
            {volunteerNav.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={pathname === item.href || pathname.startsWith(item.href + '/')}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </NavSection>
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-6 h-6 rounded-md bg-[var(--sidebar-accent)] flex items-center justify-center text-[10px] font-semibold text-muted-foreground flex-shrink-0">
              {userEmail?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="text-[11px] text-muted-foreground truncate flex-1">{userEmail}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground px-2 mb-1">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({ href, label, icon: Icon, active, onClick }: {
  href: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors',
        active
          ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] font-medium'
          : 'text-muted-foreground hover:bg-[var(--sidebar-muted)] hover:text-[var(--sidebar-foreground)]'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  )
}
