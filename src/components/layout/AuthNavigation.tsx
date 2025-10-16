'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthNavigation() {
  const { user, signOut, isAdmin, isManager } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const getRoleBadge = () => {
    if (!user?.role) return null;
    
    const roleConfig = {
      admin: { label: 'Admin', variant: 'destructive' as const },
      manager: { label: 'Manager', variant: 'default' as const },
      agent: { label: 'Agent', variant: 'secondary' as const }
    };
    
    const config = roleConfig[user.role];
    return (
      <Badge variant={config.variant} className="ml-2">
        {config.label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Button 
        onClick={() => router.push('/auth')}
        variant="outline"
      >
        <User className="mr-2 h-4 w-4" />
        Se connecter
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user.displayName || user.email}</span>
            {getRoleBadge()}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'Utilisateur'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.role && (
              <Badge variant="outline" className="w-fit mt-1">
                {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                {user.role === 'manager' && <UserCheck className="mr-1 h-3 w-3" />}
                {user.role === 'agent' && <User className="mr-1 h-3 w-3" />}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        
        {(isAdmin() || isManager()) && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Administration</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}







