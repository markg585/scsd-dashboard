'use client'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function Header({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Logged out')
    router.replace('/login')
  }

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold text-primary">SCSD Dashboard</div>

      <nav className="hidden md:flex items-center space-x-4">
        <Link href="/dashboard" className="text-sm font-medium hover:underline">Home</Link>
        <Link href="/dashboard/leads" className="text-sm font-medium hover:underline">Leads</Link>
        <Link href="/dashboard/quotes" className="text-sm font-medium hover:underline">Quotes</Link>
        <Link href="/dashboard/invoices" className="text-sm font-medium hover:underline">Invoices</Link>
        <Link href="/dashboard/schedule" className="text-sm font-medium hover:underline">Schedule</Link>
        <span className="text-muted-foreground text-sm">{userEmail}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </nav>
    </header>
  )
}
