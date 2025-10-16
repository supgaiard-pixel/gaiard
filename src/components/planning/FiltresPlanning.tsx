'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlanningStore } from '@/store/usePlanningStore';
import { CategorieIntervention, StatutIntervention } from '@/types';
import { X } from 'lucide-react';

export function FiltresPlanning() {
  const { filtres, setFiltres, resetFiltres, agents } = usePlanningStore();
  const [localFiltres, setLocalFiltres] = useState(filtres);

  const handleCategorieChange = (categorie: CategorieIntervention, checked: boolean) => {
    const newCategories = checked
      ? [...localFiltres.categories, categorie]
      : localFiltres.categories.filter(c => c !== categorie);
    
    setLocalFiltres({ ...localFiltres, categories: newCategories });
  };

  const handleAgentChange = (agentId: string, checked: boolean) => {
    const newAgents = checked
      ? [...localFiltres.agents, agentId]
      : localFiltres.agents.filter(id => id !== agentId);
    
    setLocalFiltres({ ...localFiltres, agents: newAgents });
  };

  const handleStatutChange = (statut: StatutIntervention, checked: boolean) => {
    const newStatuts = checked
      ? [...localFiltres.statuts, statut]
      : localFiltres.statuts.filter(s => s !== statut);
    
    setLocalFiltres({ ...localFiltres, statuts: newStatuts });
  };

  const applyFiltres = () => {
    setFiltres(localFiltres);
  };

  const resetLocalFiltres = () => {
    setLocalFiltres({
      categories: [],
      agents: [],
      statuts: [],
    });
    resetFiltres();
  };

  const categories = [
    { value: CategorieIntervention.INSTALLATION, label: 'Installation', color: 'bg-blue-500' },
    { value: CategorieIntervention.MAINTENANCE, label: 'Maintenance', color: 'bg-green-500' },
    { value: CategorieIntervention.REPARATION, label: 'Réparation', color: 'bg-orange-500' },
    { value: CategorieIntervention.CONTROLE, label: 'Contrôle', color: 'bg-purple-500' },
    { value: CategorieIntervention.FORMATION, label: 'Formation', color: 'bg-red-500' },
    { value: CategorieIntervention.AUTRE, label: 'Autre', color: 'bg-gray-500' },
  ];

  const statuts = [
    { value: StatutIntervention.PLANIFIEE, label: 'Planifiée', color: 'bg-gray-500' },
    { value: StatutIntervention.EN_COURS, label: 'En cours', color: 'bg-blue-500' },
    { value: StatutIntervention.TERMINEE, label: 'Terminée', color: 'bg-green-500' },
    { value: StatutIntervention.ANNULEE, label: 'Annulée', color: 'bg-red-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filtres</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLocalFiltres}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Réinitialiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtres par catégorie */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Catégories</Label>
          <div className="space-y-2">
            {categories.map((categorie) => (
              <label
                key={categorie.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFiltres.categories.includes(categorie.value)}
                  onChange={(e) => handleCategorieChange(categorie.value, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div className={`w-3 h-3 rounded-full ${categorie.color}`}></div>
                <span className="text-sm">{categorie.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtres par agent */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Agents</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {agents.map((agent) => (
              <label
                key={agent.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFiltres.agents.includes(agent.id)}
                  onChange={(e) => handleAgentChange(agent.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: agent.couleur }}
                ></div>
                <span className="text-sm">{agent.prenom} {agent.nom}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtres par statut */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Statuts</Label>
          <div className="space-y-2">
            {statuts.map((statut) => (
              <label
                key={statut.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFiltres.statuts.includes(statut.value)}
                  onChange={(e) => handleStatutChange(statut.value, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div className={`w-3 h-3 rounded-full ${statut.color}`}></div>
                <span className="text-sm">{statut.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button
            onClick={applyFiltres}
            size="sm"
            className="flex-1"
          >
            Appliquer
          </Button>
          <Button
            variant="outline"
            onClick={resetLocalFiltres}
            size="sm"
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
