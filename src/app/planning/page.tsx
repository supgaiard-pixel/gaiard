'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlanningStore } from '@/store/usePlanningStore';
import { AgentSelector } from '@/components/planning/AgentSelector';
import { AgentTimeline } from '@/components/planning/AgentTimeline';
import { Agent } from '@/types';
import { useFirebase } from '@/components/FirebaseProvider';

export default function PlanningPage() {
  const { agents, projets, phases, conges, loadAgents, loadProjets, loadPhases, loadConges } = usePlanningStore();
  const { isInitialized, error } = useFirebase();
  
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);

  // Charger les données depuis Firebase une fois initialisé
  useEffect(() => {
    if (isInitialized) {
      loadAgents();
      loadProjets();
      loadConges();
    }
  }, [isInitialized, loadAgents, loadProjets, loadConges]);

  // Charger les phases pour tous les projets
  useEffect(() => {
    if (isInitialized && projets.length > 0) {
      projets.forEach(projet => {
        loadPhases(projet.id);
      });
    }
  }, [isInitialized, projets, loadPhases]);

  // Afficher un message de chargement ou d'erreur
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Erreur Firebase</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planning par Agents</h1>
                <p className="text-gray-600">Visualisez les projets et jalons par agent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de sélection des agents */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Sélection des agents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AgentSelector
                  agents={agents}
                  selectedAgents={selectedAgents}
                  onSelectionChange={setSelectedAgents}
                  maxSelection={5}
                />
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            {selectedAgents.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Agents sélectionnés</span>
                    <span className="font-medium">{selectedAgents.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phases visibles</span>
                    <span className="font-medium">
                      {phases.filter(phase => 
                        phase.agents.some(agentId => 
                          selectedAgents.some(agent => agent.id === agentId)
                        )
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Congés visibles</span>
                    <span className="font-medium">
                      {conges.filter(conge => 
                        selectedAgents.some(agent => agent.id === conge.agentId)
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phases concernées</span>
                    <span className="font-medium">
                      {phases.filter(phase => 
                        phase.agents.some(agentId => 
                          selectedAgents.some(agent => agent.id === agentId)
                        )
                      ).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline principale */}
          <div className="lg:col-span-3">
            {selectedAgents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun agent sélectionné
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez un ou plusieurs agents pour voir leur planning et leurs projets
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>• Choisissez jusqu'à 5 agents</p>
                    <p>• Visualisez leurs projets et jalons</p>
                    <p>• Naviguez dans le temps</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AgentTimeline
                selectedAgents={selectedAgents}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
