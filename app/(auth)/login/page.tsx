'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}

interface ProjectConfig { name: string; allow_signup: boolean; allow_access_requests: boolean; access_level: string }

function LoginForm() {
  const searchParams = useSearchParams()
  // Only 'volunteer' is accepted — any other role param is ignored (security)
  const isVolunteerSignup = searchParams.get('role') === 'volunteer'
  const prefillStatus = searchParams.get('status') || ''
  const prefillSemester = searchParams.get('semester') || ''
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
    fetch('/api/project-config').then(r => r.json()).then((d: ProjectConfig) => {
      setConfig(d)
      if (!d.allow_signup && mode === 'signup' && !isVolunteerSignup) setMode('login')
    }).catch(() => setConfig({ name: 'App', allow_signup: false, allow_access_requests: false, access_level: 'staff_only' }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const projectName = config?.name || process.env.NEXT_PUBLIC_PROJECT_NAME || 'App'
  const canSignup = config?.allow_signup ?? true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true)
    if (mode === 'signup' && password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
    const supabase = createClient()
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (isVolunteerSignup) { try { await fetch('/api/volunteer/signup', { method: 'POST' }) } catch {} router.push(`/volunteer/onboarding${prefillStatus || prefillSemester ? `?status=${prefillStatus}&semester=${encodeURIComponent(prefillSemester)}` : ''}`) }
      else router.push('/dashboard')
      router.refresh()
    } else {
      const { data: signUpData, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (!signUpData.session) { setError('Account created! Check your email to confirm.'); setMode('login'); setLoading(false); return }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError('Account created! Please log in.'); setMode('login'); setLoading(false); return }
      if (isVolunteerSignup) { try { await fetch('/api/volunteer/signup', { method: 'POST' }) } catch {} router.push(`/volunteer/onboarding${prefillStatus || prefillSemester ? `?status=${prefillStatus}&semester=${encodeURIComponent(prefillSemester)}` : ''}`) }
      else router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-[360px] animate-fade-in-up">
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 mx-auto rounded-lg gradient-primary flex items-center justify-center mb-4">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {mode === 'login' ? 'Log in' : isVolunteerSignup ? 'Volunteer Sign Up' : 'Sign up'}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">{projectName}</p>
        </div>

        {/* Mode toggle */}
        {canSignup && (
          <div className="flex border rounded-lg p-0.5 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(null) }}
                className={cn('flex-1 py-2 text-[13px] rounded-md transition-colors', mode === m ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground')}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>
        )}

        {isVolunteerSignup && (
          <div className="flex items-center gap-1.5 justify-center mb-6 text-[12px] text-primary font-medium">
            <UserPlus className="w-3.5 h-3.5" /> Volunteer Account
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 pr-10 h-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Confirm password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="pl-10 h-10" />
              </div>
            </div>
          )}

          {error && (
            <div className={cn('p-3 rounded-lg text-[13px]', error.includes('created') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-10 bg-primary hover:bg-primary/90 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? 'Continue' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-8">{projectName}</p>
      </div>
    </div>
  )
}
