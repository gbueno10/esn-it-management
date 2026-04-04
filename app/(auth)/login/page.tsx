'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Loader2, Zap, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

interface ProjectConfig {
  name: string
  allow_signup: boolean
  allow_access_requests: boolean
  access_level: string
}

function LoginForm() {
  const searchParams = useSearchParams()
  const isVolunteerSignup = searchParams.get('role') === 'volunteer'

  const [config, setConfig] = useState<ProjectConfig | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>(isVolunteerSignup ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/project-config')
      .then(r => r.json())
      .then((data: ProjectConfig) => {
        setConfig(data)
        // If signup not allowed and user is in signup mode, switch to login
        if (!data.allow_signup && mode === 'signup' && !isVolunteerSignup) {
          setMode('login')
        }
      })
      .catch(() => {
        setConfig({ name: 'App', allow_signup: false, allow_access_requests: false, access_level: 'staff_only' })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const projectName = config?.name || process.env.NEXT_PUBLIC_PROJECT_NAME || 'App'
  const canSignup = config?.allow_signup ?? true // Default to true while loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (isVolunteerSignup) {
        try {
          await fetch('/api/volunteer/signup', { method: 'POST' })
        } catch { /* ignore */ }
        router.push('/volunteer/onboarding')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } else {
      const { data: signUpData, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (!signUpData.session) {
        setError('Account created! Check your email to confirm, then log in.')
        setMode('login')
        setLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Account created! Please log in.')
        setMode('login')
        setLoading(false)
        return
      }

      if (isVolunteerSignup) {
        try {
          const res = await fetch('/api/volunteer/signup', { method: 'POST' })
          if (!res.ok) {
            const data = await res.json()
            console.error('Volunteer signup error:', data.error)
          }
        } catch (err) {
          console.error('Volunteer signup error:', err)
        }
        router.push('/volunteer/onboarding')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  const title = isVolunteerSignup && mode === 'signup'
    ? 'Volunteer Sign Up'
    : mode === 'login'
      ? 'Welcome back'
      : `Join ${projectName}`

  const subtitle = isVolunteerSignup && mode === 'signup'
    ? 'Create your ESN volunteer account'
    : mode === 'login'
      ? `Sign in to ${projectName}`
      : 'Create an account to get started'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-[var(--esn-blue)]/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[var(--esn-pink)]/6 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--esn-green)]/4 rounded-full blur-3xl" />

      <div className="w-full max-w-[400px] z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-[var(--esn-blue)]/25">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {isVolunteerSignup && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              <UserPlus className="w-3.5 h-3.5" />
              Volunteer Account
            </div>
          )}
        </div>

        {/* Login card */}
        <Card className="shadow-xl shadow-slate-200/60 border-slate-200/80">
          <CardContent className="p-7">
            {/* Mode toggle — only show if signup is allowed */}
            {canSignup && (
              <div className="flex bg-muted p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null) }}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null) }}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    mode === 'signup'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className={cn(
                  'p-3.5 rounded-xl text-sm border',
                  error.includes('created')
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-100'
                )}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all h-11"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === 'signup' ? (
                  isVolunteerSignup ? 'Create Volunteer Account' : 'Create Account'
                ) : (
                  'Log In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
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
