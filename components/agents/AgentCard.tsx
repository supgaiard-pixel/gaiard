'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Agent } from '@/types';
import { Edit, Phone, Mail, User } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit }: AgentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: agent.couleur }}
            >
              {agent.prenom[0]}{agent.nom[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {agent.prenom} {agent.nom}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant={agent.actif ? 'default' : 'secondary'}>
                  {agent.actif ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(agent)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="truncate">{agent.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{agent.telephone}</span>
            </div>
          </div>

          {/* Habilitations */}
          {agent.habilitations.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Habilitations</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.habilitations.map((habilitation, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {habilitation}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
