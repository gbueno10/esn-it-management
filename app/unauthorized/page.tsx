import Link from 'next/link'

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'App'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[var(--warning)]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          You don&apos;t have permission to access {projectName}. Please contact an administrator if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20"
          >
            Try Different Account
          </Link>
        </div>
      </div>
    </div>
  )
}
