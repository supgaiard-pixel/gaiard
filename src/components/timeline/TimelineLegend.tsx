'use client';

import { useState } from 'react';
import { Info, Target, Calendar, Users, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatutProjet, StatutPhase, StatutJalonProjet, TypeJalon } from '@/types';

interface TimelineLegendProps {
  className?: string;
}

const statutProjetLabels: Record<StatutProjet, string> = {
  [StatutProjet.EN_PREPARATION]: 'En préparation',
  [StatutProjet.EN_COURS]: 'En cours',
  [StatutProjet.EN_PAUSE]: 'En pause',
  [StatutProjet.TERMINE]: 'Terminé',
  [StatutProjet.ANNULE]: 'Annulé',
};

const statutPhaseLabels: Record<StatutPhase, string> = {
  [StatutPhase.EN_ATTENTE]: 'En attente',
  [StatutPhase.EN_COURS]: 'En cours',
  [StatutPhase.TERMINE]: 'Terminé',
  [StatutPhase.RETARDE]: 'Retardé',
  [StatutPhase.ANNULE]: 'Annulé',
};

const statutJalonLabels: Record<StatutJalonProjet, string> = {
  [StatutJalonProjet.EN_ATTENTE]: 'En attente',
  [StatutJalonProjet.EN_COURS]: 'En cours',
  [StatutJalonProjet.TERMINE]: 'Terminé',
  [StatutJalonProjet.RETARDE]: 'Retardé',
  [StatutJalonProjet.ANNULE]: 'Annulé',
};

const typeJalonLabels: Record<TypeJalon, string> = {
  [TypeJalon.DEBUT_CHANTIER]: 'Début de chantier',
  [TypeJalon.FIN_PHASE_CRITIQUE]: 'Fin de phase critique',
  [TypeJalon.LIVRAISON_MATERIEL]: 'Livraison matériel',
  [TypeJalon.CONTROLE_TECHNIQUE]: 'Contrôle technique',
  [TypeJalon.MISE_EN_SERVICE]: 'Mise en service',
  [TypeJalon.RECEPTION_CLIENT]: 'Réception client',
  [TypeJalon.AUTRE]: 'Autre',
};

export function TimelineLegend({ className }: TimelineLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatutProjetColor = (statut: StatutProjet) => {
    switch (statut) {
      case StatutProjet.EN_PREPARATION:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case StatutProjet.EN_COURS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case StatutProjet.EN_PAUSE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case StatutProjet.TERMINE:
        return 'bg-green-100 text-green-800 border-green-200';
      case StatutProjet.ANNULE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutPhaseColor = (statut: StatutPhase) => {
    switch (statut) {
      case StatutPhase.EN_ATTENTE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case StatutPhase.EN_COURS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case StatutPhase.TERMINE:
        return 'bg-green-100 text-green-800 border-green-200';
      case StatutPhase.RETARDE:
        return 'bg-red-100 text-red-800 border-red-200';
      case StatutPhase.ANNULE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutJalonColor = (statut: StatutJalonProjet) => {
    switch (statut) {
      case StatutJalonProjet.EN_ATTENTE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case StatutJalonProjet.EN_COURS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case StatutJalonProjet.TERMINE:
        return 'bg-green-100 text-green-800 border-green-200';
      case StatutJalonProjet.RETARDE:
        return 'bg-red-100 text-red-800 border-red-200';
      case StatutJalonProjet.ANNULE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutIcon = (statut: StatutProjet | StatutPhase | StatutJalonProjet) => {
    if (statut === StatutProjet.TERMINE || statut === StatutPhase.TERMINE || statut === StatutJalonProjet.TERMINE) {
      return <CheckCircle className="h-4 w-4" />;
    }
    if (statut === StatutProjet.EN_COURS || statut === StatutPhase.EN_COURS || statut === StatutJalonProjet.EN_COURS) {
      return <Clock className="h-4 w-4" />;
    }
    if (statut === StatutProjet.EN_PAUSE || statut === StatutPhase.RETARDE || statut === StatutJalonProjet.RETARDE) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Info className="h-4 w-4 mr-2" />
          Légende
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Légende de la timeline</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statuts de projet */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Statuts de projet</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(statutProjetLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(key as StatutProjet)}
                      <Badge className={getStatutProjetColor(key as StatutProjet)}>
                        {label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statuts de phase */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Statuts de phase</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(statutPhaseLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(key as StatutPhase)}
                      <Badge className={getStatutPhaseColor(key as StatutPhase)}>
                        {label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statuts de jalon */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Statuts de jalon</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(statutJalonLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(key as StatutJalonProjet)}
                      <Badge className={getStatutJalonColor(key as StatutJalonProjet)}>
                        {label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Types de jalon */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Types de jalon</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(typeJalonLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symboles et couleurs */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Symboles</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 rounded"></div>
                  <span>Barre de phase</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Jalon</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Weekend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>En retard</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Navigation</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>Clic sur jalon</strong> : Voir les détails</div>
                <div>• <strong>Clic sur phase</strong> : Informations</div>
                <div>• <strong>Molette souris</strong> : Zoom</div>
                <div>• <strong>Glisser</strong> : Déplacer la vue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

