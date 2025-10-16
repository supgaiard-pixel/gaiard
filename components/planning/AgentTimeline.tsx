'use client';

import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Agent, Projet, Phase, Conge } from '@/types';
import { usePlanningStore } from '@/store/usePlanningStore';

interface AgentTimelineProps {
  selectedAgents: Agent[];
  viewMode: 'week' | 'month' | 'quarter' | 'year';
  onViewModeChange: (mode: 'week' | 'month' | 'quarter' | 'year') => void;
}

type ViewMode = 'week' | 'month' | 'quarter' | 'year';

export function AgentTimeline({ selectedAgents, viewMode, onViewModeChange }: AgentTimelineProps) {
  const { projets, phases, conges } = usePlanningStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fonction utilitaire pour normaliser les dates
  const normalizeDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Calculer la plage de dates selon le mode de vue
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (viewMode) {
      case 'week':
        const dayOfWeek = start.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setDate(start.getDate() + mondayOffset);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth(quarter * 3 + 3, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }
    
    return { start, end };
  }, [currentDate, viewMode]);

  // Calculer la largeur des colonnes
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'week': return 40;
      case 'month': return 20;
      case 'quarter': return 15;
      case 'year': return 8;
      default: return 20;
    }
  };

  // Générer les dates pour l'en-tête
  const timelineDates = useMemo(() => {
    const dates = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      dates.push({
        date: new Date(current),
        dayOfWeek,
        isWeekend,
        dayName: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][dayOfWeek],
        dayNameFull: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayOfWeek]
      });
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [dateRange]);

  // Obtenir les phases des agents sélectionnés
  const agentPhases = useMemo(() => {
    const agentPhases: Array<{
      agent: Agent;
      phase: Phase;
      projet: Projet;
    }> = [];
    
    selectedAgents.forEach(agent => {
      phases.forEach(phase => {
        if (phase.agents.includes(agent.id)) {
          const projet = projets.find(p => p.id === phase.projectId);
          if (projet) {
            agentPhases.push({
              agent,
              phase,
              projet
            });
          }
        }
      });
    });

    return agentPhases;
  }, [selectedAgents, phases, projets]);

  // Obtenir les congés des agents sélectionnés
  const agentConges = useMemo(() => {
    return conges.filter(conge => 
      selectedAgents.some(agent => agent.id === conge.agentId)
    );
  }, [selectedAgents, conges]);

  // Navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const multiplier = direction === 'next' ? 1 : -1;
    
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() + (7 * multiplier));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + multiplier);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (3 * multiplier));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + multiplier);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const totalWidth = timelineDates.length * getColumnWidth();

  return (
    <div className="space-y-6">
      {/* Contrôles de navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="flex items-center space-x-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Aujourd'hui</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-lg font-semibold">
            {viewMode === 'week' && `Semaine du ${dateRange.start.toLocaleDateString()}`}
            {viewMode === 'month' && dateRange.start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            {viewMode === 'quarter' && `T${Math.floor(dateRange.start.getMonth() / 3) + 1} ${dateRange.start.getFullYear()}`}
            {viewMode === 'year' && dateRange.start.getFullYear().toString()}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(['week', 'month', 'quarter', 'year'] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange(mode)}
            >
              {mode === 'week' && 'Semaine'}
              {mode === 'month' && 'Mois'}
              {mode === 'quarter' && 'Trimestre'}
              {mode === 'year' && 'Année'}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          {/* En-tête des dates */}
          <div className="border-b bg-gray-50">
            <div className="flex">
              <div className="w-64 p-4 border-r bg-gray-100">
                <div className="font-medium text-gray-700">Agents & Projets</div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex">
                  {timelineDates.map((dateInfo, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 p-2 text-center border-r ${
                        dateInfo.isWeekend ? 'bg-gray-100' : 'bg-white'
                      }`}
                      style={{ width: getColumnWidth() }}
                    >
                      <div className={`text-xs font-medium ${
                        dateInfo.isWeekend ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {dateInfo.dayName}
                      </div>
                      <div className={`text-xs ${
                        dateInfo.isWeekend ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {dateInfo.date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lignes des agents, leurs phases et congés */}
          <div className="space-y-0">
            {selectedAgents.map((agent) => {
              const agentPhasesData = agentPhases.filter(item => item.agent.id === agent.id);
              const phasesVisibles = agentPhasesData.filter(item => {
                const phaseStart = new Date(item.phase.dateDebut);
                const phaseEnd = new Date(item.phase.dateFin);
                return !(phaseEnd < dateRange.start || phaseStart > dateRange.end);
              });

              const agentCongesData = agentConges.filter(conge => conge.agentId === agent.id);
              const congesVisibles = agentCongesData.filter(conge => {
                const congeStart = new Date(conge.dateDebut);
                const congeEnd = new Date(conge.dateFin);
                return !(congeEnd < dateRange.start || congeStart > dateRange.end);
              });

              return (
                <div key={agent.id} className="border-b">
                  {/* Ligne de l'agent */}
                  <div className="flex items-center bg-blue-50 border-b">
                    <div className="w-64 p-4 border-r bg-blue-100 flex-shrink-0">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: agent.couleur }}
                        >
                          {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-blue-800">
                            {agent.prenom} {agent.nom}
                          </div>
                          <div className="text-xs text-blue-600">
                            {phasesVisibles.length} phase{phasesVisibles.length > 1 ? 's' : ''} • {congesVisibles.length} congé{congesVisibles.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative" style={{ height: '40px' }}>
                      {/* Phases de l'agent */}
                      {phasesVisibles.map((item, phaseIndex) => {
                        const phaseStart = new Date(item.phase.dateDebut);
                        const phaseEnd = new Date(item.phase.dateFin);
                        const phaseStartNormalized = normalizeDate(phaseStart);
                        const phaseEndNormalized = normalizeDate(phaseEnd);
                        const timelineStartNormalized = normalizeDate(dateRange.start);
                        
                        // Calculer la position de début
                        const startX = (phaseStartNormalized.getTime() - timelineStartNormalized.getTime()) / (1000 * 60 * 60 * 24) * getColumnWidth();
                        
                        // Calculer la largeur en excluant les weekends
                        let totalWidth = 0;
                        const currentDate = new Date(phaseStartNormalized);
                        const endDate = new Date(phaseEndNormalized);
                        
                        while (currentDate <= endDate) {
                          const dayOfWeek = currentDate.getDay();
                          // Ne compter que les jours de semaine (lundi à vendredi)
                          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                            totalWidth += getColumnWidth();
                          }
                          currentDate.setDate(currentDate.getDate() + 1);
                        }
                        
                        return (
                          <div
                            key={`phase-${item.agent.id}-${item.phase.id}-${phaseIndex}`}
                            className="absolute top-2 h-6 rounded shadow-sm border-l-2 border-r-2 cursor-pointer hover:shadow-md transition-shadow"
                            style={{
                              left: startX,
                              width: Math.max(getColumnWidth(), totalWidth),
                              backgroundColor: item.phase.couleur || '#3B82F6',
                              borderLeftColor: item.phase.couleur || '#3B82F6',
                              borderRightColor: item.phase.couleur || '#3B82F6',
                              zIndex: 1
                            }}
                            title={`${item.phase.nom} - ${phaseStart.toLocaleDateString()} au ${phaseEnd.toLocaleDateString()}`}
                          />
                        );
                      })}

                      {/* Congés de l'agent */}
                      {congesVisibles.map((conge, congeIndex) => {
                        const congeStart = new Date(conge.dateDebut);
                        const congeEnd = new Date(conge.dateFin);
                        const congeStartNormalized = normalizeDate(congeStart);
                        const congeEndNormalized = normalizeDate(congeEnd);
                        const timelineStartNormalized = normalizeDate(dateRange.start);
                        
                        // Calculer la position de début
                        const startX = (congeStartNormalized.getTime() - timelineStartNormalized.getTime()) / (1000 * 60 * 60 * 24) * getColumnWidth();
                        
                        // Calculer la largeur en excluant les weekends
                        let totalWidth = 0;
                        const currentDate = new Date(congeStartNormalized);
                        const endDate = new Date(congeEndNormalized);
                        
                        while (currentDate <= endDate) {
                          const dayOfWeek = currentDate.getDay();
                          // Ne compter que les jours de semaine (lundi à vendredi)
                          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                            totalWidth += getColumnWidth();
                          }
                          currentDate.setDate(currentDate.getDate() + 1);
                        }
                        
                        return (
                          <div
                            key={`conge-${conge.id}-${congeIndex}`}
                            className="absolute top-2 h-6 rounded shadow-sm border-l-2 border-r-2 cursor-pointer hover:shadow-md transition-shadow opacity-80"
                            style={{
                              left: startX,
                              width: Math.max(getColumnWidth(), totalWidth),
                              backgroundColor: '#F59E0B', // Couleur orange pour les congés
                              borderLeftColor: '#F59E0B',
                              borderRightColor: '#F59E0B',
                              zIndex: 2
                            }}
                            title={`Congé - ${congeStart.toLocaleDateString()} au ${congeEnd.toLocaleDateString()} (${conge.type})`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Lignes des phases */}
                  {phasesVisibles.map((item, index) => {
                    const phaseStart = new Date(item.phase.dateDebut);
                    const phaseEnd = new Date(item.phase.dateFin);
                    const phaseStartNormalized = normalizeDate(phaseStart);
                    const phaseEndNormalized = normalizeDate(phaseEnd);
                    
                    // Calculer la largeur en excluant les weekends
                    let totalWidth = 0;
                    const currentDate = new Date(phaseStartNormalized);
                    const endDate = new Date(phaseEndNormalized);
                    
                    while (currentDate <= endDate) {
                      const dayOfWeek = currentDate.getDay();
                      // Ne compter que les jours de semaine (lundi à vendredi)
                      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                        totalWidth += getColumnWidth();
                      }
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    
                    return (
                      <div key={`phase-detail-${item.agent.id}-${item.phase.id}-${index}`} className="flex items-center hover:bg-gray-50">
                        <div className="w-64 p-4 border-r pl-8 flex-shrink-0">
                          <div className="font-medium text-sm text-gray-800">{item.phase.nom}</div>
                          <div className="text-xs text-gray-500">
                            {item.projet.nom} • {item.phase.duree} jour{item.phase.duree > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex-1 relative" style={{ height: '32px' }}>
                          {/* Barre de la phase */}
                          <div
                            className="absolute top-2 h-6 rounded shadow-sm border-l-2 border-r-2"
                            style={{
                              left: (phaseStartNormalized.getTime() - normalizeDate(dateRange.start).getTime()) / (1000 * 60 * 60 * 24) * getColumnWidth(),
                              width: Math.max(getColumnWidth(), totalWidth),
                              backgroundColor: item.phase.couleur || '#3B82F6',
                              borderLeftColor: item.phase.couleur || '#3B82F6',
                              borderRightColor: item.phase.couleur || '#3B82F6'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Lignes des congés */}
                  {congesVisibles.map((conge, index) => {
                    const congeStart = new Date(conge.dateDebut);
                    const congeEnd = new Date(conge.dateFin);
                    const congeStartNormalized = normalizeDate(congeStart);
                    const congeEndNormalized = normalizeDate(congeEnd);
                    
                    // Calculer la largeur en excluant les weekends
                    let totalWidth = 0;
                    const currentDate = new Date(congeStartNormalized);
                    const endDate = new Date(congeEndNormalized);
                    
                    while (currentDate <= endDate) {
                      const dayOfWeek = currentDate.getDay();
                      // Ne compter que les jours de semaine (lundi à vendredi)
                      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                        totalWidth += getColumnWidth();
                      }
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    
                    return (
                      <div key={`conge-detail-${conge.id}-${index}`} className="flex items-center hover:bg-orange-50">
                        <div className="w-64 p-4 border-r pl-8 flex-shrink-0">
                          <div className="font-medium text-sm text-orange-800">Congé</div>
                          <div className="text-xs text-orange-600">
                            {conge.type} • {Math.ceil((congeEnd.getTime() - congeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1} jour{Math.ceil((congeEnd.getTime() - congeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1 > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex-1 relative" style={{ height: '32px' }}>
                          {/* Barre du congé */}
                          <div
                            className="absolute top-2 h-6 rounded shadow-sm border-l-2 border-r-2 opacity-80"
                            style={{
                              left: (congeStartNormalized.getTime() - normalizeDate(dateRange.start).getTime()) / (1000 * 60 * 60 * 24) * getColumnWidth(),
                              width: Math.max(getColumnWidth(), totalWidth),
                              backgroundColor: '#F59E0B',
                              borderLeftColor: '#F59E0B',
                              borderRightColor: '#F59E0B'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
