'use client';

import { useEffect, useState } from 'react';
import { testFirebaseConfig, testAuthMethods } from '@/utils/firebaseTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { FirestoreTest } from '@/components/debug/FirestoreTest';

export default function DebugPage() {
  const [configStatus, setConfigStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const runTests = async () => {
      addLog('🔧 Démarrage des tests Firebase...');
      
      // Test de la configuration
      try {
        const configResult = await testFirebaseConfig();
        setConfigStatus(configResult ? 'success' : 'error');
        addLog(configResult ? '✅ Configuration Firebase OK' : '❌ Configuration Firebase échouée');
      } catch (error) {
        setConfigStatus('error');
        addLog(`❌ Erreur configuration: ${error}`);
      }
      
      // Test de l'authentification
      try {
        const authResult = await testAuthMethods();
        setAuthStatus(authResult ? 'success' : 'error');
        addLog(authResult ? '✅ Authentification OK' : '❌ Authentification échouée');
      } catch (error) {
        setAuthStatus('error');
        addLog(`❌ Erreur authentification: ${error}`);
      }
    };

    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Diagnostic Firebase</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(configStatus)}
                Configuration Firebase
              </CardTitle>
              <CardDescription>
                Test de l'initialisation et de la configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configuration Firebase correcte
                  </AlertDescription>
                </Alert>
              )}
              {configStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erreur de configuration Firebase
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(authStatus)}
                Service d'authentification
              </CardTitle>
              <CardDescription>
                Test des méthodes d'authentification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Service d'authentification disponible
                  </AlertDescription>
                </Alert>
              )}
              {authStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Service d'authentification non disponible
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <FirestoreTest />

        <Card>
          <CardHeader>
            <CardTitle>📋 Logs de diagnostic</CardTitle>
            <CardDescription>
              Détails des tests effectués
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Aucun log disponible</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            🔄 Relancer les tests
          </Button>
        </div>
      </div>
    </div>
  );
}
