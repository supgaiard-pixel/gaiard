'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthRedirect } from '@/components/auth/AuthRedirect';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {mode === 'login' && (
            <LoginForm
              onSwitchToReset={() => setMode('reset')}
            />
          )}
          
          {mode === 'reset' && (
            <ResetPasswordForm
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </AuthRedirect>
  );
}
