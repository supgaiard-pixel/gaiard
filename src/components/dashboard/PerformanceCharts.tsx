'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Agent, Projet, Phase, JalonProjet } from '@/types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PerformanceChartsProps {
  agents: Agent[];
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
}

export function PerformanceCharts({ agents, projets, phases, jalons }: PerformanceChartsProps) {
  
  // Graphique 1: Évolution des jalons par semaine
  const getJalonsParSemaine = () => {
    const semaines = [];
    const aujourdhui = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const date = new Date(aujourdhui);
      date.setDate(date.getDate() - (i * 7));
      const debutSemaine = startOfWeek(date, { weekStartsOn: 1 });
      const finSemaine = endOfWeek(date, { weekStartsOn: 1 });
      
      const jalonsSemaine = jalons.filter(jalon => 
        isWithinInterval(jalon.dateEcheance, { start: debutSemaine, end: finSemaine })
      );
      
      semaines.push({
        semaine: format(debutSemaine, 'dd/MM', { locale: fr }),
        total: jalonsSemaine.length,
        termines: jalonsSemaine.filter(j => j.statut === 'termine').length,
        enRetard: jalonsSemaine.filter(j => j.dateEcheance < new Date() && j.statut !== 'termine').length
      });
    }
    
    return semaines;
  };
  
  // Graphique 2: Charge de travail par agent
  const getChargeParAgent = () => {
    return agents.map(agent => {
      const phasesAgent = phases.filter(phase => phase.agents.includes(agent.id));
      const jalonsAgent = jalons.filter(jalon => {
        const projetPhases = phases.filter(phase => phase.projectId === jalon.projectId);
        return projetPhases.some(phase => phase.agents.includes(agent.id));
      });
      
      return {
        nom: `${agent.prenom} ${agent.nom}`,
        phases: phasesAgent.length,
        jalons: jalonsAgent.length,
        charge: phasesAgent.length + jalonsAgent.length
      };
    }).sort((a, b) => b.charge - a.charge);
  };
  
  // Graphique 3: Statut des projets
  const getStatutProjets = () => {
    const statuts = {
      'en_cours': 0,
      'termine': 0,
      'en_attente': 0,
      'retarde': 0
    };
    
    projets.forEach(projet => {
      const projetPhases = phases.filter(phase => phase.projectId === projet.id);
      if (projetPhases.length === 0) {
        statuts.en_attente++;
      } else if (projetPhases.every(phase => phase.statut === 'termine')) {
        statuts.termine++;
      } else if (projetPhases.some(phase => phase.statut === 'en_cours')) {
        statuts.en_cours++;
      } else {
        statuts.en_attente++;
      }
    });
    
    return Object.entries(statuts).map(([statut, count]) => ({
      statut: statut.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      color: statut === 'termine' ? 'bg-green-500' : 
             statut === 'en_cours' ? 'bg-blue-500' : 
             statut === 'retarde' ? 'bg-red-500' : 'bg-gray-500'
    }));
  };
  
  const jalonsParSemaine = getJalonsParSemaine();
  const chargeParAgent = getChargeParAgent();
  const statutProjets = getStatutProjets();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique 1: Évolution des jalons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Évolution des Jalons</span>
            <Badge variant="outline">4 semaines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jalonsParSemaine.map((semaine, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Semaine du {semaine.semaine}</span>
                  <span className="text-sm text-gray-500">{semaine.total} jalons</span>
                </div>
                <div className="flex space-x-1">
                  <div 
                    className="h-2 bg-green-500 rounded"
                    style={{ width: `${(semaine.termines / Math.max(semaine.total, 1)) * 100}%` }}
                  />
                  <div 
                    className="h-2 bg-red-500 rounded"
                    style={{ width: `${(semaine.enRetard / Math.max(semaine.total, 1)) * 100}%` }}
                  />
                  <div 
                    className="h-2 bg-gray-300 rounded"
                    style={{ width: `${((semaine.total - semaine.termines - semaine.enRetard) / Math.max(semaine.total, 1)) * 100}%` }}
                  />
                </div>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span>{semaine.termines} terminés</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded"></div>
                    <span>{semaine.enRetard} en retard</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graphique 2: Charge de travail par agent */}
      <Card>
        <CardHeader>
          <CardTitle>Charge de Travail par Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chargeParAgent.slice(0, 5).map((agent, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate">{agent.nom}</span>
                    <Badge variant="outline" className="text-xs">
                      {agent.charge} tâches
                    </Badge>
                  </div>
                  <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                    <span>{agent.phases} phases</span>
                    <span>{agent.jalons} jalons</span>
                  </div>
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      agent.charge > 8 ? 'bg-red-500' : 
                      agent.charge > 5 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((agent.charge / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {chargeParAgent.length > 5 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{chargeParAgent.length - 5} autres agents
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graphique 3: Statut des projets */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Répartition des Projets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statutProjets.map((statut, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${statut.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold text-xl">{statut.count}</span>
                </div>
                <div className="text-sm font-medium">{statut.statut}</div>
                <div className="text-xs text-gray-500">
                  {Math.round((statut.count / projets.length) * 100)}% du total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}








