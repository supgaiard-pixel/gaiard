'use client';

import { useState } from 'react';
import { Users, X, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Agent } from '@/types';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgents: Agent[];
  onSelectionChange: (agents: Agent[]) => void;
  maxSelection?: number;
}

export function AgentSelector({ 
  agents, 
  selectedAgents, 
  onSelectionChange, 
  maxSelection = 5 
}: AgentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filtrer les agents selon la recherche
  const filteredAgents = agents.filter(agent => 
    agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agents disponibles (non sélectionnés)
  const availableAgents = filteredAgents.filter(agent => 
    !selectedAgents.some(selected => selected.id === agent.id)
  );

  const handleSelectAgent = (agent: Agent) => {
    if (selectedAgents.length < maxSelection) {
      onSelectionChange([...selectedAgents, agent]);
    }
  };

  const handleRemoveAgent = (agentId: string) => {
    onSelectionChange(selectedAgents.filter(agent => agent.id !== agentId));
  };

  const getAgentInitials = (agent: Agent) => {
    return `${agent.prenom.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Agents sélectionnés */}
      <div className="flex flex-wrap gap-2">
        {selectedAgents.map((agent) => (
          <Badge
            key={agent.id}
            variant="secondary"
            className="flex items-center space-x-2 px-3 py-1"
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: agent.couleur }}
            >
              {getAgentInitials(agent)}
            </div>
            <span>{agent.prenom} {agent.nom}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveAgent(agent.id)}
              className="h-4 w-4 p-0 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {selectedAgents.length < maxSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un agent</span>
          </Button>
        )}
      </div>

      {/* Dropdown de sélection */}
      {isOpen && (
        <Card className="absolute z-10 w-full max-w-md">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Liste des agents disponibles */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableAgents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchTerm ? 'Aucun agent trouvé' : 'Aucun agent disponible'}
                  </p>
                ) : (
                  availableAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={() => {
                        handleSelectAgent(agent);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                        style={{ backgroundColor: agent.couleur }}
                      >
                        {getAgentInitials(agent)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {agent.prenom} {agent.nom}
                        </p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                      {agent.habilitations && agent.habilitations.length > 0 && (
                        <div className="flex space-x-1">
                          {agent.habilitations.slice(0, 2).map((hab, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {hab}
                            </Badge>
                          ))}
                          {agent.habilitations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.habilitations.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message si aucun agent sélectionné */}
      {selectedAgents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Aucun agent sélectionné</p>
          <p className="text-sm">Sélectionnez un ou plusieurs agents pour voir leur planning</p>
        </div>
      )}
    </div>
  );
}








