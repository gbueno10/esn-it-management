'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'App'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-[var(--primary)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[var(--secondary)]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm z-10">
        {/* Logo/Title Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome back' : `Join ${projectName}`}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'login'
                ? 'Sign in to access your account'
                : 'Create an account to get started'}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null) }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null) }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative group">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 gradient-primary text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : mode === 'signup' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Create Account
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="h-px w-8 bg-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{projectName}</span>
            <div className="h-px w-8 bg-current" />
          </div>
        </div>
      </div>
    </div>
  )
}
