'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Agent, Projet, Phase, JalonProjet, Conge } from '@/types';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardMetricsProps {
  agents: Agent[];
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  conges: Conge[];
}

export function DashboardMetrics({ 
  agents, 
  projets, 
  phases, 
  jalons, 
  conges 
}: DashboardMetricsProps) {
  
  // Calculs des métriques
  const totalAgents = agents.length;
  const totalProjets = projets.length;
  const totalPhases = phases.length;
  const totalJalons = jalons.length;
  
  // Projets en cours
  const projetsEnCours = projets.filter(projet => {
    const projetPhases = phases.filter(phase => phase.projectId === projet.id);
    return projetPhases.some(phase => phase.statut === 'en_cours');
  }).length;
  
  // Jalons en retard
  const jalonsEnRetard = jalons.filter(jalon => 
    isPast(jalon.dateEcheance) && jalon.statut !== 'termine' && jalon.statut !== 'annule'
  ).length;
  
  // Jalons critiques (dans les 7 prochains jours)
  const jalonsCritiques = jalons.filter(jalon => {
    const joursRestants = differenceInDays(jalon.dateEcheance, new Date());
    return joursRestants <= 7 && joursRestants >= 0 && jalon.statut !== 'termine';
  }).length;
  
  // Agents en congé aujourd'hui
  const agentsEnConge = conges.filter(conge => {
    const aujourdhui = new Date();
    return aujourdhui >= conge.dateDebut && aujourdhui <= conge.dateFin;
  }).length;
  
  // Phases terminées cette semaine
  const phasesTerminees = phases.filter(phase => {
    const semaineDerniere = new Date();
    semaineDerniere.setDate(semaineDerniere.getDate() - 7);
    return phase.statut === 'termine' && phase.updatedAt >= semaineDerniere;
  }).length;
  
  // Taux de réussite des jalons
  const jalonsTermines = jalons.filter(jalon => jalon.statut === 'termine').length;
  const tauxReussiteJalons = totalJalons > 0 ? Math.round((jalonsTermines / totalJalons) * 100) : 0;
  
  // Charge de travail moyenne par agent
  const phasesParAgent = agents.map(agent => {
    const phasesAgent = phases.filter(phase => phase.agents.includes(agent.id));
    return phasesAgent.length;
  });
  const chargeMoyenne = phasesParAgent.length > 0 
    ? Math.round(phasesParAgent.reduce((a, b) => a + b, 0) / phasesParAgent.length * 10) / 10 
    : 0;

  const metrics = [
    {
      title: 'Agents Actifs',
      value: totalAgents,
      subtitle: `${agentsEnConge} en congé aujourd'hui`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: agentsEnConge > 0 ? 'down' : 'neutral'
    },
    {
      title: 'Projets en Cours',
      value: projetsEnCours,
      subtitle: `sur ${totalProjets} projets`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: projetsEnCours > totalProjets * 0.8 ? 'up' : 'neutral'
    },
    {
      title: 'Jalons en Retard',
      value: jalonsEnRetard,
      subtitle: jalonsCritiques > 0 ? `${jalonsCritiques} critiques` : 'Aucun retard',
      icon: AlertTriangle,
      color: jalonsEnRetard > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: jalonsEnRetard > 0 ? 'bg-red-100' : 'bg-green-100',
      trend: jalonsEnRetard > 0 ? 'down' : 'up'
    },
    {
      title: 'Taux de Réussite',
      value: `${tauxReussiteJalons}%`,
      subtitle: `${jalonsTermines}/${totalJalons} jalons terminés`,
      icon: Target,
      color: tauxReussiteJalons >= 80 ? 'text-green-600' : 'text-orange-600',
      bgColor: tauxReussiteJalons >= 80 ? 'bg-green-100' : 'bg-orange-100',
      trend: tauxReussiteJalons >= 80 ? 'up' : 'down'
    },
    {
      title: 'Phases Terminées',
      value: phasesTerminees,
      subtitle: 'Cette semaine',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: phasesTerminees > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Charge Moyenne',
      value: chargeMoyenne,
      subtitle: 'Phases par agent',
      icon: Clock,
      color: chargeMoyenne > 5 ? 'text-orange-600' : 'text-blue-600',
      bgColor: chargeMoyenne > 5 ? 'bg-orange-100' : 'bg-blue-100',
      trend: chargeMoyenne > 5 ? 'down' : 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                         metric.trend === 'down' ? TrendingDown : null;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                {TrendIcon && (
                  <TrendIcon 
                    className={`h-4 w-4 ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 
                      'text-gray-400'
                    }`} 
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metric.subtitle}
              </p>
              {metric.title === 'Jalons en Retard' && jalonsEnRetard > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Attention requise
                </Badge>
              )}
              {metric.title === 'Charge Moyenne' && chargeMoyenne > 5 && (
                <Badge variant="outline" className="mt-2 text-orange-600 border-orange-600">
                  Surcharge détectée
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}








