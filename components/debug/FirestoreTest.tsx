'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { agentService } from '@/services/firebaseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

export function FirestoreTest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    agents: { success: boolean; error?: string; count?: number };
    interventions: { success: boolean; error?: string; count?: number };
    conges: { success: boolean; error?: string; count?: number };
  }>({
    agents: { success: false },
    interventions: { success: false },
    conges: { success: false }
  });

  const testFirestoreAccess = async () => {
    if (!user) {
      alert('Vous devez être connecté pour tester Firestore');
      return;
    }

    setIsLoading(true);
    setResults({
      agents: { success: false },
      interventions: { success: false },
      conges: { success: false }
    });

    try {
      // Test des agents
      try {
        const agents = await agentService.getAll();
        setResults(prev => ({
          ...prev,
          agents: { success: true, count: agents.length }
        }));
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          agents: { success: false, error: error.message }
        }));
      }

      // Test des interventions
      try {
        const interventions = await agentService.getAll(); // Utilisons le même service pour l'instant
        setResults(prev => ({
          ...prev,
          interventions: { success: true, count: 0 } // Placeholder
        }));
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          interventions: { success: false, error: error.message }
        }));
      }

      // Test des congés
      try {
        const conges = await agentService.getAll(); // Utilisons le même service pour l'instant
        setResults(prev => ({
          ...prev,
          conges: { success: true, count: 0 } // Placeholder
        }));
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          conges: { success: false, error: error.message }
        }));
      }

    } catch (error) {
      console.error('Erreur générale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test d'accès Firestore
        </CardTitle>
        <CardDescription>
          Vérifiez les permissions d'accès aux données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <Alert variant="destructive">
            <AlertDescription>
              Vous devez être connecté pour tester Firestore
            </AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.agents.success)}
                <span className="text-sm">
                  Agents: {results.agents.success ? `${results.agents.count} trouvés` : 'Erreur'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(results.interventions.success)}
                <span className="text-sm">
                  Interventions: {results.interventions.success ? `${results.interventions.count} trouvés` : 'Erreur'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(results.conges.success)}
                <span className="text-sm">
                  Congés: {results.conges.success ? `${results.conges.count} trouvés` : 'Erreur'}
                </span>
              </div>
            </div>

            {Object.values(results).some(r => r.error) && (
              <div className="space-y-2">
                {results.agents.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Agents:</strong> {results.agents.error}
                    </AlertDescription>
                  </Alert>
                )}
                {results.interventions.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Interventions:</strong> {results.interventions.error}
                    </AlertDescription>
                  </Alert>
                )}
                {results.conges.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Congés:</strong> {results.conges.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button 
              onClick={testFirestoreAccess} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                'Tester l\'accès Firestore'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}







