'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conge, TypeConge, StatutConge } from '@/types';
import { Agent } from '@/types';
import { Edit, Calendar, User, Clock } from 'lucide-react';

interface CongeCardProps {
  conge: Conge;
  agent?: Agent;
  onEdit: (conge: Conge) => void;
}

export function CongeCard({ conge, agent, onEdit }: CongeCardProps) {
  const getTypeColor = (type: TypeConge) => {
    const colors = {
      [TypeConge.ANNUEL]: 'bg-blue-100 text-blue-800',
      [TypeConge.MALADIE]: 'bg-red-100 text-red-800',
      [TypeConge.MATERNITE]: 'bg-pink-100 text-pink-800',
      [TypeConge.PATERNITE]: 'bg-purple-100 text-purple-800',
      [TypeConge.RTT]: 'bg-green-100 text-green-800',
      [TypeConge.AUTRE]: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors[TypeConge.AUTRE];
  };

  const getStatutColor = (statut: StatutConge) => {
    const colors = {
      [StatutConge.EN_ATTENTE]: 'bg-orange-100 text-orange-800',
      [StatutConge.VALIDE]: 'bg-green-100 text-green-800',
      [StatutConge.REFUSE]: 'bg-red-100 text-red-800',
    };
    return colors[statut];
  };

  const getTypeLabel = (type: TypeConge) => {
    const labels = {
      [TypeConge.ANNUEL]: 'Annuel',
      [TypeConge.MALADIE]: 'Maladie',
      [TypeConge.MATERNITE]: 'Maternité',
      [TypeConge.PATERNITE]: 'Paternité',
      [TypeConge.RTT]: 'RTT',
      [TypeConge.AUTRE]: 'Autre',
    };
    return labels[type];
  };

  const getStatutLabel = (statut: StatutConge) => {
    const labels = {
      [StatutConge.EN_ATTENTE]: 'En attente',
      [StatutConge.VALIDE]: 'Validé',
      [StatutConge.REFUSE]: 'Refusé',
    };
    return labels[statut];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getDuration = () => {
    const diffTime = conge.dateFin.getTime() - conge.dateDebut.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {agent && (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: agent.couleur }}
              >
                {agent.prenom[0]}{agent.nom[0]}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {agent ? `${agent.prenom} ${agent.nom}` : 'Agent inconnu'}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(conge.type)}>
                  {getTypeLabel(conge.type)}
                </Badge>
                <Badge className={getStatutColor(conge.statut)}>
                  {getStatutLabel(conge.statut)}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(conge)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(conge.dateDebut)} - {formatDate(conge.dateFin)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{getDuration()} jour{getDuration() > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Motif */}
          {conge.motif && (
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Motif</span>
              </div>
              <p className="text-sm text-gray-600">{conge.motif}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
