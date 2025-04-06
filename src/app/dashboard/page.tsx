'use client'

import Header from '@/components/layout/Header'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)

  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-muted text-muted-foreground">
      <Header userEmail={user.email ?? ''} />
      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-primary">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Use the navigation to manage leads, quotes, and your schedule.
        </p>
      </main>
    </div>
  )
}
