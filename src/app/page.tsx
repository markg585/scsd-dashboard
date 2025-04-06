'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

export default function HomeRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard') // 🔁 Send logged-in users to dashboard
      } else {
        router.replace('/login') // 🔒 Send non-auth users to login
      }
    }
  }, [user, loading, router])

  return <div className="p-6 text-center">Redirecting...</div>
}
