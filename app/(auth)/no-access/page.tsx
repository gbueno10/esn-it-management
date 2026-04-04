'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldX, LogOut, SendHorizonal, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectConfig {
  name: string
  allow_signup: boolean
  allow_access_requests: boolean
  access_level: string
}

const accessLevelLabels: Record<string, string> = {
  public: 'This app is open to everyone.',
  staff_only: 'This app is restricted to ESN staff members.',
  admin_only: 'This app is restricted to ESN admins.',
  custom: 'This app requires an explicit invitation.',
}

export default function NoAccessPage() {
  const [config, setConfig] = useState<ProjectConfig | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/project-config')
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {})
  }, [])

  async function handleRequestAccess() {
    setRequesting(true)
    setError(null)
    const slug = process.env.NEXT_PUBLIC_PROJECT_SLUG
    const res = await fetch('/api/volunteer/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_slug: slug }),
    })
    setRequesting(false)
    if (res.ok) {
      setRequested(true)
    } else {
      const data = await res.json().catch(() => ({ error: 'Request failed' }))
      setError(data.error)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const projectName = config?.name || process.env.NEXT_PUBLIC_PROJECT_NAME || 'this app'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-[var(--esn-blue)]/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[var(--esn-pink)]/6 rounded-full blur-3xl" />

      <div className="w-full max-w-[420px] z-10 animate-fade-in-up">
        <div className="text-center mb-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-amber-600" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">No Access</h1>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have access to <strong>{projectName}</strong>
            </p>
          </div>
        </div>

        <Card className="shadow-xl shadow-slate-200/60 border-slate-200/80">
          <CardContent className="p-7 space-y-5">
            {config && (
              <p className="text-sm text-muted-foreground text-center">
                {accessLevelLabels[config.access_level] || 'Access to this app is restricted.'}
              </p>
            )}

            {/* Request access button */}
            {config?.allow_access_requests && !requested && (
              <Button
                onClick={handleRequestAccess}
                disabled={requesting}
                className="w-full gradient-primary border-0 text-white h-11"
              >
                {requesting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SendHorizonal className="h-4 w-4 mr-2" />
                )}
                Request Access
              </Button>
            )}

            {/* Success state */}
            {requested && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700">Request sent!</p>
                  <p className="text-xs text-green-600 mt-0.5">An admin will review your request.</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3.5 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Sign out */}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign in with a different account
            </Button>

            {!config?.allow_access_requests && !requested && (
              <p className="text-xs text-muted-foreground text-center">
                Contact an ESN admin if you need access.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3 text-muted-foreground/40">
            <div className="h-px w-8 bg-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{projectName}</span>
            <div className="h-px w-8 bg-current" />
          </div>
        </div>
      </div>
    </div>
  )
}
