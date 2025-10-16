'use client';

import { useState, useMemo } from 'react';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Projet, Phase, StatutPhase } from '@/types';

interface TimelineVisualProps {
  projet: Projet;
}

export function TimelineVisual({ projet }: TimelineVisualProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  // Calculer les dimensions de la timeline
  const timelineData = useMemo(() => {
    if (!projet.phases.length) return null;

    const startDate = new Date(Math.min(...projet.phases.map(p => p.dateDebut.getTime())));
    const endDate = new Date(Math.max(...projet.phases.map(p => p.dateFin.getTime())));
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      startDate,
      endDate,
      totalDays,
      phases: projet.phases.map(phase => {
        const startOffset = Math.floor((phase.dateDebut.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const duration = Math.ceil((phase.dateFin.getTime() - phase.dateDebut.getTime()) / (1000 * 60 * 60 * 24));
        const width = (duration / totalDays) * 100;
        const left = (startOffset / totalDays) * 100;
        
        return {
          ...phase,
          startOffset,
          duration,
          width,
          left,
        };
      }),
    };
  }, [projet.phases]);

  const getStatutColor = (statut: StatutPhase) => {
    switch (statut) {
      case StatutPhase.EN_ATTENTE:
        return 'bg-yellow-500';
      case StatutPhase.EN_COURS:
        return 'bg-blue-500';
      case StatutPhase.TERMINE:
        return 'bg-green-500';
      case StatutPhase.RETARDE:
        return 'bg-red-500';
      case StatutPhase.ANNULE:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatutLabel = (statut: StatutPhase) => {
    switch (statut) {
      case StatutPhase.EN_ATTENTE:
        return 'En attente';
      case StatutPhase.EN_COURS:
        return 'En cours';
      case StatutPhase.TERMINE:
        return 'Terminé';
      case StatutPhase.RETARDE:
        return 'Retardé';
      case StatutPhase.ANNULE:
        return 'Annulé';
      default:
        return statut;
    }
  };

  if (!timelineData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune phase définie
          </h3>
          <p className="text-gray-600">
            Ajoutez des phases à ce projet pour voir la timeline
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header du projet */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projet.nom}</h1>
            <p className="text-gray-600 mt-1">{projet.client}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {projet.adresse}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {projet.dateDebut.toLocaleDateString()} - {projet.dateFin.toLocaleDateString()}
              </div>
            </div>
          </div>
          <Badge className="text-sm px-3 py-1">
            {projet.phases.length} phase{projet.phases.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Timeline du projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Ligne de temps */}
            <div className="relative">
              {/* Axe temporel */}
              <div className="h-8 bg-gray-100 rounded mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-gray-600">
                  <span>{timelineData.startDate.toLocaleDateString()}</span>
                  <span>{timelineData.endDate.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-3">
                {timelineData.phases.map((phase, index) => (
                  <div key={phase.id} className="relative">
                    {/* Nom de la phase */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: phase.couleur }}
                        />
                        <span className="font-medium text-gray-900">{phase.nom}</span>
                        <Badge 
                          className={`text-xs ${getStatutColor(phase.statut)} text-white`}
                        >
                          {getStatutLabel(phase.statut)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {phase.duration} jour{phase.duration > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Barre de la phase */}
                    <div className="relative h-12 bg-gray-50 rounded border">
                      <div
                        className={`absolute top-1 h-10 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatutColor(phase.statut)}`}
                        style={{
                          left: `${phase.left}%`,
                          width: `${phase.width}%`,
                          backgroundColor: phase.couleur,
                        }}
                        onClick={() => setSelectedPhase(selectedPhase?.id === phase.id ? null : phase)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                          {phase.nom}
                        </div>
                      </div>
                    </div>

                    {/* Détails de la phase (si sélectionnée) */}
                    {selectedPhase?.id === phase.id && (
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Agents assignés</h4>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {phase.agents.length} agent{phase.agents.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {phase.dateDebut.toLocaleDateString()} - {phase.dateFin.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Durée</h4>
                            <span className="text-sm text-gray-600">
                              {phase.duree} jour{phase.duree > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
