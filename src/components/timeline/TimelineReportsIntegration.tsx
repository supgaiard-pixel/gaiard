'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Users, Target, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Projet, Phase, JalonProjet, Rapport, TypeRapport } from '@/types';
import { usePlanningStore } from '@/store/usePlanningStore';

interface TimelineReportsIntegrationProps {
  projet: Projet;
  phases: Phase[];
  jalons: JalonProjet[];
  onRapportClick?: (rapport: Rapport) => void;
  onNouveauRapport?: (projetId: string, phaseId?: string, jalonId?: string) => void;
}

const typeRapportLabels: Record<TypeRapport, string> = {
  [TypeRapport.INTERVENTION]: 'Intervention',
  [TypeRapport.INCIDENCE]: 'Incidence',
  [TypeRapport.VISITE_CHANTIER]: 'Visite chantier',
  [TypeRapport.REUNION]: 'Réunion',
  [TypeRapport.SECURITE]: 'Sécurité',
  [TypeRapport.QUALITE]: 'Qualité',
  [TypeRapport.MAINTENANCE]: 'Maintenance',
  [TypeRapport.RAPPORT_STAGE]: 'Rapport de stage',
  [TypeRapport.AUTRE]: 'Autre',
};

export function TimelineReportsIntegration({ 
  projet, 
  phases, 
  jalons, 
  onRapportClick, 
  onNouveauRapport 
}: TimelineReportsIntegrationProps) {
  const { rapports, loadRapports } = usePlanningStore();
  const [projetRapports, setProjetRapports] = useState<Rapport[]>([]);
  const [rapportsByPhase, setRapportsByPhase] = useState<{ [phaseId: string]: Rapport[] }>({});
  const [rapportsByJalon, setRapportsByJalon] = useState<{ [jalonId: string]: Rapport[] }>({});
  const [stats, setStats] = useState({
    totalRapports: 0,
    rapportsParType: {} as { [key: string]: number },
    rapportsRecents: 0,
    rapportsExternes: 0,
  });

  // Charger les rapports du projet
  useEffect(() => {
    if (projet.id) {
      loadRapports();
    }
  }, [projet.id, loadRapports]);

  // Filtrer et organiser les rapports
  useEffect(() => {
    const projetRapports = rapports.filter(r => r.projetId === projet.id);
    setProjetRapports(projetRapports);

    // Grouper par phase
    const byPhase: { [phaseId: string]: Rapport[] } = {};
    phases.forEach(phase => {
      byPhase[phase.id] = projetRapports.filter(r => 
        r.description.toLowerCase().includes(phase.nom.toLowerCase()) ||
        r.titre.toLowerCase().includes(phase.nom.toLowerCase())
      );
    });
    setRapportsByPhase(byPhase);

    // Grouper par jalon
    const byJalon: { [jalonId: string]: Rapport[] } = {};
    jalons.forEach(jalon => {
      byJalon[jalon.id] = projetRapports.filter(r => 
        r.description.toLowerCase().includes(jalon.titre.toLowerCase()) ||
        r.titre.toLowerCase().includes(jalon.titre.toLowerCase())
      );
    });
    setRapportsByJalon(byJalon);

    // Calculer les statistiques
    const rapportsParType: { [key: string]: number } = {};
    let rapportsRecents = 0;
    let rapportsExternes = 0;

    projetRapports.forEach(rapport => {
      // Par type
      const typeKey = rapport.type;
      rapportsParType[typeKey] = (rapportsParType[typeKey] || 0) + 1;

      // Récents (derniers 7 jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (rapport.createdAt > sevenDaysAgo) {
        rapportsRecents++;
      }

      // Externes
      if (rapport.isExterne) {
        rapportsExternes++;
      }
    });

    setStats({
      totalRapports: projetRapports.length,
      rapportsParType,
      rapportsRecents,
      rapportsExternes,
    });
  }, [rapports, projet.id, phases, jalons]);

  const handleNouveauRapport = (type: 'projet' | 'phase' | 'jalon', id?: string) => {
    if (onNouveauRapport) {
      if (type === 'projet') {
        onNouveauRapport(projet.id);
      } else if (type === 'phase' && id) {
        onNouveauRapport(projet.id, id);
      } else if (type === 'jalon' && id) {
        onNouveauRapport(projet.id, undefined, id);
      }
    }
  };

  const getTypeColor = (type: TypeRapport) => {
    switch (type) {
      case TypeRapport.INTERVENTION:
        return 'bg-blue-100 text-blue-800';
      case TypeRapport.INCIDENCE:
        return 'bg-red-100 text-red-800';
      case TypeRapport.VISITE_CHANTIER:
        return 'bg-green-100 text-green-800';
      case TypeRapport.REUNION:
        return 'bg-purple-100 text-purple-800';
      case TypeRapport.SECURITE:
        return 'bg-orange-100 text-orange-800';
      case TypeRapport.QUALITE:
        return 'bg-yellow-100 text-yellow-800';
      case TypeRapport.MAINTENANCE:
        return 'bg-gray-100 text-gray-800';
      case TypeRapport.RAPPORT_STAGE:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Rapports du projet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRapports}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.rapportsRecents}</div>
              <div className="text-sm text-gray-600">Récents (7j)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.rapportsExternes}</div>
              <div className="text-sm text-gray-600">Externes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.rapportsParType).length}
              </div>
              <div className="text-sm text-gray-600">Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNouveauRapport('projet')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau rapport projet</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/rapports/externe', '_blank')}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Accès externe</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rapports par type */}
      {Object.keys(stats.rapportsParType).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Rapports par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.rapportsParType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(type as TypeRapport)}>
                      {typeRapportLabels[type as TypeRapport] || type}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rapports récents */}
      {projetRapports.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Rapports récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projetRapports
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5)
                .map(rapport => (
                  <div
                    key={rapport.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => onRapportClick?.(rapport)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {rapport.titre}
                        </h4>
                        <Badge className={getTypeColor(rapport.type)}>
                          {typeRapportLabels[rapport.type]}
                        </Badge>
                        {rapport.isExterne && (
                          <Badge variant="outline" className="text-xs">
                            Externe
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rapport.dateRapport.toLocaleDateString('fr-FR')} • 
                        {rapport.redacteur ? `Par ${rapport.redacteur.prenom} ${rapport.redacteur.nom}` : 'Rapport externe'}
                      </div>
                    </div>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rapports par phase */}
      {phases.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Rapports par phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phases.map(phase => {
                const phaseRapports = rapportsByPhase[phase.id] || [];
                return (
                  <div key={phase.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{phase.nom}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{phaseRapports.length}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNouveauRapport('phase', phase.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {phaseRapports.length > 0 && (
                      <div className="space-y-1">
                        {phaseRapports.slice(0, 3).map(rapport => (
                          <div
                            key={rapport.id}
                            className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                            onClick={() => onRapportClick?.(rapport)}
                          >
                            • {rapport.titre} ({rapport.dateRapport.toLocaleDateString('fr-FR')})
                          </div>
                        ))}
                        {phaseRapports.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{phaseRapports.length - 3} autres...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

