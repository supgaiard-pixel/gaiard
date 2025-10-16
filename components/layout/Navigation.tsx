'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BarChart3, Settings, Home, GitBranch, Bell, FileText } from 'lucide-react';
import { AuthNavigation } from './AuthNavigation';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Planning', href: '/planning', icon: Calendar },
  { name: 'Timeline', href: '/timeline', icon: GitBranch },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Congés', href: '/conges', icon: BarChart3 },
  { name: 'Rapports', href: '/reports', icon: FileText },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                    alt="GAIAR Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
                <span className="font-bold text-xl text-gray-900">GAIAR</span>
          </Link>

          {/* Navigation principale - seulement si connecté */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="flex items-center space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Menu utilisateur */}
          <div className="flex items-center space-x-2">
            <AuthNavigation />
          </div>
        </div>
      </div>
    </nav>
  );
}
