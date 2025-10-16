'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { Agent, Projet, Phase, JalonProjet, Conge } from '@/types';
import { format, isPast, differenceInDays, isToday, isTomorrow, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'jalon' | 'agent' | 'projet' | 'planning';
  title: string;
  description: string;
  severity: number; // 1-5, 5 étant le plus critique
  timestamp: Date;
  resolved: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertSystemProps {
  agents: Agent[];
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  conges: Conge[];
}

export function AlertSystem({ 
  agents, 
  projets, 
  phases, 
  jalons, 
  conges 
}: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // Générer les alertes automatiques
  useEffect(() => {
    const newAlerts: Alert[] = [];

    // 1. Jalons en retard (CRITIQUE)
    const jalonsEnRetard = jalons.filter(jalon => 
      isPast(jalon.dateEcheance) && jalon.statut !== 'termine' && jalon.statut !== 'annule'
    );
    
    jalonsEnRetard.forEach(jalon => {
      const joursRetard = differenceInDays(new Date(), jalon.dateEcheance);
      newAlerts.push({
        id: `jalon-retard-${jalon.id}`,
        type: 'critical',
        category: 'jalon',
        title: `Jalon en retard: ${jalon.titre}`,
        description: `Le jalon est en retard depuis ${joursRetard} jour(s). Action immédiate requise.`,
        severity: Math.min(joursRetard + 1, 5),
        timestamp: new Date(),
        resolved: false
      });
    });

    // 2. Jalons critiques (dans les 2 prochains jours)
    const jalonsCritiques = jalons.filter(jalon => {
      const joursRestants = differenceInDays(jalon.dateEcheance, new Date());
      return joursRestants <= 2 && joursRestants >= 0 && jalon.statut !== 'termine';
    });
    
    jalonsCritiques.forEach(jalon => {
      const joursRestants = differenceInDays(jalon.dateEcheance, new Date());
      newAlerts.push({
        id: `jalon-critique-${jalon.id}`,
        type: 'warning',
        category: 'jalon',
        title: `Jalon critique: ${jalon.titre}`,
        description: `Le jalon arrive à échéance dans ${joursRestants} jour(s). Vérification nécessaire.`,
        severity: 4,
        timestamp: new Date(),
        resolved: false
      });
    });

    // 3. Surcharge d'agents
    const agentsSurcharges = agents.filter(agent => {
      const phasesAgent = phases.filter(phase => phase.agents.includes(agent.id));
      return phasesAgent.length > 8;
    });
    
    agentsSurcharges.forEach(agent => {
      const phasesAgent = phases.filter(phase => phase.agents.includes(agent.id));
      newAlerts.push({
        id: `surcharge-${agent.id}`,
        type: 'warning',
        category: 'agent',
        title: `Surcharge: ${agent.prenom} ${agent.nom}`,
        description: `L'agent a ${phasesAgent.length} phases assignées. Risque de surcharge.`,
        severity: 3,
        timestamp: new Date(),
        resolved: false
      });
    });

    // 4. Agents indisponibles pour des phases critiques
    const phasesCritiques = phases.filter(phase => {
      const joursRestants = differenceInDays(phase.dateFin, new Date());
      return joursRestants <= 3 && phase.statut === 'en_cours';
    });

    phasesCritiques.forEach(phase => {
      const agentsEnConge = phase.agents.filter(agentId => {
        const agentConges = conges.filter(conge => conge.agentId === agentId);
        return agentConges.some(conge => {
          const aujourdhui = new Date();
          return aujourdhui >= conge.dateDebut && aujourdhui <= conge.dateFin;
        });
      });

      if (agentsEnConge.length > 0) {
        newAlerts.push({
          id: `phase-critique-${phase.id}`,
          type: 'warning',
          category: 'planning',
          title: `Phase critique avec agents indisponibles`,
          description: `La phase "${phase.nom}" est critique mais ${agentsEnConge.length} agent(s) assigné(s) sont en congé.`,
          severity: 4,
          timestamp: new Date(),
          resolved: false
        });
      }
    });

    // 5. Projets sans phases
    const projetsSansPhases = projets.filter(projet => {
      const projetPhases = phases.filter(phase => phase.projectId === projet.id);
      return projetPhases.length === 0;
    });
    
    projetsSansPhases.forEach(projet => {
      newAlerts.push({
        id: `projet-sans-phases-${projet.id}`,
        type: 'info',
        category: 'projet',
        title: `Projet sans phases: ${projet.nom}`,
        description: `Le projet n'a aucune phase définie. Planification nécessaire.`,
        severity: 2,
        timestamp: new Date(),
        resolved: false
      });
    });

    // 6. Phases en retard
    const phasesEnRetard = phases.filter(phase => 
      isPast(phase.dateFin) && phase.statut === 'en_cours'
    );
    
    phasesEnRetard.forEach(phase => {
      const joursRetard = differenceInDays(new Date(), phase.dateFin);
      newAlerts.push({
        id: `phase-retard-${phase.id}`,
        type: 'warning',
        category: 'projet',
        title: `Phase en retard: ${phase.nom}`,
        description: `La phase est en retard depuis ${joursRetard} jour(s). Mise à jour du statut nécessaire.`,
        severity: 3,
        timestamp: new Date(),
        resolved: false
      });
    });

    // 7. Jalons sans statut
    const jalonsSansStatut = jalons.filter(jalon => 
      !jalon.statut || jalon.statut === 'en_attente'
    );
    
    if (jalonsSansStatut.length > 0) {
      newAlerts.push({
        id: 'jalons-sans-statut',
        type: 'info',
        category: 'jalon',
        title: `${jalonsSansStatut.length} jalon(s) sans statut`,
        description: `Des jalons nécessitent une mise à jour de statut pour un suivi optimal.`,
        severity: 2,
        timestamp: new Date(),
        resolved: false
      });
    }

    setAlerts(newAlerts);
  }, [agents, projets, phases, jalons, conges]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'info':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 5) return 'bg-red-600';
    if (severity >= 4) return 'bg-orange-600';
    if (severity >= 3) return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Système d'Alertes</span>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-xs">
              {alerts.length} alertes
            </Badge>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} critiques
              </Badge>
            )}
          </div>
        </CardTitle>
        
        {/* Filtres */}
        <div className="flex space-x-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toutes ({alerts.length})
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
            className="text-red-600 border-red-600"
          >
            Critiques ({criticalCount})
          </Button>
          <Button
            variant={filter === 'warning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('warning')}
            className="text-orange-600 border-orange-600"
          >
            Avertissements ({warningCount})
          </Button>
          <Button
            variant={filter === 'info' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('info')}
            className="text-blue-600 border-blue-600"
          >
            Info ({infoCount})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Aucune alerte</p>
            <p className="text-sm">Tout fonctionne correctement</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredAlerts
              .sort((a, b) => b.severity - a.severity)
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-gray-100 ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {alert.title}
                          </h4>
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(alert.timestamp, 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            alert.severity >= 4 ? 'text-red-600 border-red-600' :
                            alert.severity >= 3 ? 'text-orange-600 border-orange-600' :
                            'text-blue-600 border-blue-600'
                          }`}
                        >
                          Sévérité {alert.severity}/5
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}








