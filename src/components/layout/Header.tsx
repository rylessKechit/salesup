import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  Menu,
  Target,
  Users
} from 'lucide-react'

interface HeaderProps {
  user?: {
    firstName: string
    lastName: string
    role: 'agent' | 'manager'
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'
  
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold text-sixt-black">SalesUp</span>
        </Link>

        {/* Navigation */}
        <nav className="ml-8 hidden md:flex items-center space-x-6">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          {user?.role === 'manager' && (
            <>
              <Link 
                href="/dashboard/admin" 
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Team Management</span>
              </Link>
              <Link 
                href="/goals" 
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="ml-auto md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right side - Desktop */}
        <div className="ml-auto hidden md:flex items-center space-x-4">
          {/* Role Badge */}
          {user && (
            <Badge variant={user.role === 'manager' ? 'default' : 'secondary'} className="capitalize">
              {user.role}
            </Badge>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}