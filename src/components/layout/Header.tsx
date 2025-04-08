'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'

interface HeaderProps {
  userEmail: string
}

export default function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/leads', label: 'Leads' },
    { href: '/dashboard/jobsite/list', label: 'Job Sites' }, // ✅ Added
    { href: '/quotes', label: 'Quotes' },
    { href: '/schedule', label: 'Schedule' },
  ]

  return (
    <header className="w-full border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* App Title */}
        <div className="text-lg font-semibold text-primary">
          <Link href="/dashboard">SCSD Dashboard</Link>
        </div>

        {/* Top Nav */}
        <nav className="flex flex-wrap gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'transition',
                pathname.startsWith(item.href)
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground hidden sm:inline">{userEmail}</span>
          <Button size="sm" variant="outline" onClick={() => signOut(auth)}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
