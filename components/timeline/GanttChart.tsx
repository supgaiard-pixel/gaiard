'use client';

import { useState, useMemo } from 'react';
import { Projet, Phase, JalonProjet, Creneau } from '@/types';
import { usePlanningStore } from '@/store/usePlanningStore';
import { calculateProjectDates } from '@/utils/projectUtils';
import { Button } from '@/components/ui/button';
import { Calendar, ZoomIn, ZoomOut, RotateCcw, Target, Download, Filter, Info, Search } from 'lucide-react';
import { JalonsManagerModal } from './JalonsManagerModal';
import { TimelineFilters, TimelineFiltersState } from './TimelineFilters';
import { TimelineLegend } from './TimelineLegend';
import { TimelineNotifications } from './TimelineNotifications';
import { TimelineSearch, SearchResult } from './TimelineSearch';
import { timelineExportService } from '@/services/timelineExportService';
import { dependenciesService } from '@/services/dependenciesService';

interface GanttChartProps {
  projets: Projet[];
  onJalonClick?: (jalon: JalonProjet) => void;
  onCreneauClick?: (creneau: any, phase: Phase, projet: Projet) => void;
  onPhaseClick?: (phase: Phase, projet: Projet) => void;
  onProjectClick?: (projet: Projet) => void;
}

interface GanttBar {
  phase: Phase;
  projet: Projet;
  startX: number;
  width: number;
  color: string;
}

interface GanttMilestone {
  jalon: JalonProjet;
  projet: Projet;
  x: number;
  color: string;
}

type ViewMode = 'week' | 'month' | 'quarter' | 'year';

export function GanttChart({ projets, onJalonClick, onCreneauClick, onPhaseClick, onProjectClick }: GanttChartProps) {
  const { phases, jalons, agents } = usePlanningStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isJalonsModalOpen, setIsJalonsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [filters, setFilters] = useState<TimelineFiltersState>({
    projets: [],
    statutsProjet: [],
    clients: [],
    statutsPhase: [],
    agents: [],
    statutsJalon: [],
    typesJalon: [],
    jalonsEnRetard: false,
    dateDebut: undefined,
    dateFin: undefined,
    recherche: '',
    afficherProjetsSansPhases: true,
    afficherJalonsSeulement: false,
    afficherRetardsSeulement: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [violations, setViolations] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);

  // Fonction utilitaire pour normaliser les dates (supprimer l'heure)
  const normalizeDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  
  // Calculer la plage de dates selon le mode de vue
  const dateRange = useMemo(() => {
    const today = new Date();
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (viewMode) {
      case 'week':
        // Semaine courante (lundi à dimanche)
        const dayOfWeek = start.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setDate(start.getDate() + mondayOffset);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        // Mois courant
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'quarter':
        // Trimestre courant
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth(quarter * 3 + 3, 0);
        break;
      case 'year':
        // Année courante
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }
    
    return { start, end };
  }, [currentDate, viewMode]);

  // Calculer la largeur des colonnes selon le mode de vue
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'week': return 40; // Plus large pour la semaine
      case 'month': return 20;
      case 'quarter': return 15;
      case 'year': return 8;
      default: return 20;
    }
  };

  // Filtrer les projets selon les filtres
  const filteredProjets = useMemo(() => {
    return projets.filter(projet => {
      // Filtre par recherche
      if (filters.recherche) {
        const searchTerm = filters.recherche.toLowerCase();
        const matchesSearch = projet.nom.toLowerCase().includes(searchTerm) ||
                            projet.client.toLowerCase().includes(searchTerm) ||
                            projet.description.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtre par statut de projet
      if (filters.statutsProjet.length > 0 && !filters.statutsProjet.includes(projet.statut)) {
        return false;
      }

      // Filtre par client
      if (filters.clients.length > 0 && !filters.clients.includes(projet.client)) {
        return false;
      }

      // Filtre par période
      if (filters.dateDebut && projet.dateFin < filters.dateDebut) {
        return false;
      }
      if (filters.dateFin && projet.dateDebut > filters.dateFin) {
        return false;
      }

      return true;
    });
  }, [projets, filters]);

  // Calculer toutes les phases avec leurs créneaux
  const ganttBars = useMemo(() => {
    const allPhases: GanttBar[] = [];
    const timelineStart = dateRange.start;
    const timelineEnd = dateRange.end;
    const dayWidth = getColumnWidth();

    filteredProjets.forEach(projet => {
      const projetPhases = phases.filter(phase => phase.projectId === projet.id);
      if (projetPhases && projetPhases.length > 0) {
        projetPhases.forEach(phase => {
          // Filtre par statut de phase
          if (filters.statutsPhase.length > 0 && !filters.statutsPhase.includes(phase.statut)) {
            return;
          }

          // Filtre par agents
          if (filters.agents.length > 0 && !phase.agents.some(agentId => filters.agents.includes(agentId))) {
            return;
          }

          // Vérifier si la phase a des créneaux
          if (phase.creneaux && phase.creneaux.length > 0) {
            // Vérifier si au moins un créneau de la phase chevauche avec la période
            const hasVisibleCreneaux = phase.creneaux.some(creneau => {
              const creneauStart = new Date(creneau.dateDebut);
              const creneauEnd = new Date(creneau.dateFin);
              return !(creneauEnd < timelineStart || creneauStart > timelineEnd);
            });
            
            if (hasVisibleCreneaux) {
              // Créer une entrée pour la phase avec tous ses créneaux
              allPhases.push({
                phase,
                projet,
                startX: 0, // Sera calculé dynamiquement pour chaque créneau
                width: 0, // Sera calculé dynamiquement pour chaque créneau
                color: phase.couleur || '#3B82F6'
              });
            }
          } else {
            // Phase sans créneaux (comportement legacy)
            const phaseStart = new Date(phase.dateDebut);
            const phaseEnd = new Date(phase.dateFin);
            
            const phaseOverlaps = !(phaseEnd < timelineStart || phaseStart > timelineEnd);
            
            if (phaseOverlaps) {
              const phaseStartNormalized = normalizeDate(phaseStart);
              const phaseEndNormalized = normalizeDate(phaseEnd);
              const timelineStartNormalized = normalizeDate(timelineStart);
              
              const startOffset = (phaseStartNormalized.getTime() - timelineStartNormalized.getTime()) / (1000 * 60 * 60 * 24);
              // CORRECTION: Ajouter 1 jour pour inclure la date de fin
              const phaseDuration = Math.max(1, (phaseEndNormalized.getTime() - phaseStartNormalized.getTime()) / (1000 * 60 * 60 * 24) + 1);
              
              allPhases.push({
                phase,
                projet,
                startX: startOffset * dayWidth,
                width: phaseDuration * dayWidth,
                color: phase.couleur || '#3B82F6'
              });
            }
          }
        });
      }
    });

    return allPhases.sort((a, b) => a.phase.ordre - b.phase.ordre);
  }, [filteredProjets, phases, dateRange, viewMode, filters]);

  // Calculer les jalons visibles
  const ganttMilestones = useMemo(() => {
    const allMilestones: GanttMilestone[] = [];
    const timelineStart = dateRange.start;
    const timelineEnd = dateRange.end;
    const dayWidth = getColumnWidth();

    filteredProjets.forEach(projet => {
      const projetJalons = jalons.filter(jalon => jalon.projectId === projet.id);
      
      projetJalons.forEach(jalon => {
        // Filtre par statut de jalon
        if (filters.statutsJalon.length > 0 && !filters.statutsJalon.includes(jalon.statut)) {
          return;
        }

        // Filtre par type de jalon
        if (filters.typesJalon.length > 0 && !filters.typesJalon.includes(jalon.type)) {
          return;
        }

        // Filtre jalons en retard
        if (filters.jalonsEnRetard) {
          const today = new Date();
          const echeance = new Date(jalon.dateEcheance);
          if (echeance >= today || jalon.statut === 'termine') {
            return;
          }
        }

        const jalonDate = new Date(jalon.dateEcheance);
        
        // Vérifier si le jalon est dans la période visible
        if (jalonDate >= timelineStart && jalonDate <= timelineEnd) {
          const jalonDateNormalized = normalizeDate(jalonDate);
          const timelineStartNormalized = normalizeDate(timelineStart);
          
          const x = (jalonDateNormalized.getTime() - timelineStartNormalized.getTime()) / (1000 * 60 * 60 * 24) * dayWidth;
          
          allMilestones.push({
            jalon,
            projet,
            x,
            color: jalon.couleur || '#ef4444' // Rouge par défaut
          });
        }
      });
    });

    return allMilestones.sort((a, b) => a.jalon.ordre - b.jalon.ordre);
  }, [filteredProjets, jalons, dateRange, viewMode, filters]);

  // Générer les dates pour l'en-tête avec informations détaillées
  const timelineDates = useMemo(() => {
    const dates = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Dimanche ou Samedi
      const currentDate = new Date(current);
      currentDate.setHours(0, 0, 0, 0);
      const isToday = currentDate.getTime() === today.getTime();
      
      dates.push({
        date: new Date(current),
        dayOfWeek,
        isWeekend,
        isToday,
        dayName: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][dayOfWeek],
        dayNameFull: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayOfWeek]
      });
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [dateRange]);

  // Grouper les dates par mois pour l'affichage
  const monthsInRange = useMemo(() => {
    const months = new Map();
    timelineDates.forEach(({ date }) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!months.has(monthKey)) {
        months.set(monthKey, {
          name: monthName,
          startDate: new Date(date),
          days: 0
        });
      }
      months.get(monthKey).days++;
    });
    return Array.from(months.values());
  }, [timelineDates]);

  // Grouper les phases par projet
  const phasesByProjet = useMemo(() => {
    const grouped: { [key: string]: GanttBar[] } = {};
    ganttBars.forEach(bar => {
      if (!grouped[bar.projet.id]) {
        grouped[bar.projet.id] = [];
      }
      grouped[bar.projet.id].push(bar);
    });
    return grouped;
  }, [ganttBars]);

  // Fonctions d'export et de gestion
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdfUrl = await timelineExportService.exportTimeline({
        projets: filteredProjets,
        phases,
        jalons,
        agents,
        dateDebut: filters.dateDebut,
        dateFin: filters.dateFin,
        titre: `Timeline GAIAR - ${new Date().toLocaleDateString('fr-FR')}`,
        includeLegend: true,
        includeStats: true,
      });

      // Télécharger le PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `timeline-gaiar-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleJalonsClick = () => {
    setIsJalonsModalOpen(true);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.type === 'projet') {
      setSelectedProjet(result.item as Projet);
    } else if (result.type === 'jalon' && onJalonClick) {
      onJalonClick(result.item as JalonProjet);
    }
  };


  const totalWidth = timelineDates.length * getColumnWidth();

  // Fonctions de navigation
  const goToToday = () => {
    setCurrentDate(new Date());
  };

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

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header avec contrôles de navigation */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Diagramme de Gantt</h3>
            <p className="text-sm text-gray-500">Timeline des projets et phases</p>
          </div>
          
          {/* Contrôles de navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              ←
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
              className="flex items-center space-x-1"
              onClick={handleJalonsClick}
            >
              <Target className="h-4 w-4" />
              <span>Jalons</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Export...' : 'Export PDF'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              →
            </Button>
          </div>
        </div>
        
        {/* Sélecteur de vue et outils */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Vue:</span>
            {(['week', 'month', 'quarter', 'year'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="text-xs"
              >
                {mode === 'week' && 'Semaine'}
                {mode === 'month' && 'Mois'}
                {mode === 'quarter' && 'Trimestre'}
                {mode === 'year' && 'Année'}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <TimelineSearch
              projets={filteredProjets}
              phases={phases}
              jalons={jalons}
              agents={agents}
              onResultClick={handleSearchResultClick}
            />
            <TimelineNotifications
              jalons={jalons}
              violations={violations}
              onJalonClick={onJalonClick}
            />
            <TimelineFilters
              agents={agents}
              onFiltersChange={setFilters}
              initialFilters={filters}
            />
            <TimelineLegend />
          </div>
        </div>
      </div>
      
      {projets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun projet à afficher</p>
          <p className="text-sm">Créez votre premier projet pour voir la timeline</p>
        </div>
      ) : ganttBars.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune phase dans cette période</p>
          <p className="text-sm">Changez la période ou créez des phases pour cette période</p>
          <div className="mt-4 flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              <Calendar className="h-4 w-4 mr-2" />
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
              Vue Mois
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Ligne des mois */}
          <div className="flex border-b bg-gray-100">
            <div className="w-48 p-2 border-r bg-gray-200 font-medium text-sm text-gray-700 flex-shrink-0">
              <div className="text-center">Période</div>
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {monthsInRange.map((month, monthIndex) => (
                <div
                  key={monthIndex}
                  className="border-r text-sm font-medium text-gray-800 p-2 text-center flex-shrink-0"
                  style={{ width: month.days * getColumnWidth(), minWidth: month.days * getColumnWidth() }}
                >
                  {month.name}
                </div>
              ))}
            </div>
          </div>

          {/* En-tête amélioré avec jours de la semaine */}
          <div className="flex border-b bg-gray-50">
            <div className="w-48 p-3 border-r bg-gray-100 font-medium text-sm text-gray-700 flex-shrink-0">
              Projets / Phases
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {timelineDates.map((dateInfo, index) => (
                <div
                  key={index}
                  className={`border-r text-xs p-1 text-center flex-shrink-0 ${
                    dateInfo.isToday
                      ? 'bg-blue-100 text-blue-800 border-blue-300' 
                      : dateInfo.isWeekend 
                        ? 'bg-gray-200 text-gray-500' 
                        : 'bg-white text-gray-700'
                  }`}
                  style={{ width: getColumnWidth(), minWidth: getColumnWidth() }}
                >
                  <div className={`font-medium ${dateInfo.isToday ? 'text-blue-900' : ''}`}>
                    {dateInfo.date.getDate()}
                  </div>
                  <div className={`text-xs opacity-75 ${dateInfo.isToday ? 'text-blue-700' : ''}`}>
                    {dateInfo.dayName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lignes des projets et phases */}
          <div className="space-y-0">
            {filteredProjets.map((projet) => {
              const projetPhases = phases.filter(phase => phase.projectId === projet.id);
              const { dateDebut, dateFin } = calculateProjectDates(projetPhases);
              
              // Vérifier si le projet a des phases dans la période visible
              const hasVisiblePhases = phasesByProjet[projet.id] && phasesByProjet[projet.id].length > 0;
              
              // Ne pas afficher le projet s'il n'a aucune phase dans la période
              if (!hasVisiblePhases) {
                return null;
              }
              
              return (
                <div key={projet.id} className="border-b">
                  {/* Ligne du projet */}
                  <div className="flex items-center bg-blue-50 border-b">
                    <div className="w-48 p-3 border-r bg-blue-100 flex-shrink-0">
                      <div 
                        className="font-medium text-blue-800 cursor-pointer hover:text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectClick?.(projet);
                        }}
                      >
                        {projet.nom}
                      </div>
                      <div className="text-xs text-blue-600">
                        {projetPhases.length > 0 ? (
                          `${dateDebut.toLocaleDateString()} - ${dateFin.toLocaleDateString()}`
                        ) : (
                          'Aucune phase définie'
                        )}
                      </div>
                    </div>
                    <div className="flex relative" style={{ width: totalWidth, height: '40px' }}>
                      {/* Surbrillance de la colonne du jour actuel */}
                      {timelineDates.map((dateInfo, index) => {
                        if (dateInfo.isToday) {
                          return (
                            <div
                              key={`today-${index}`}
                              className="absolute top-0 bottom-0 bg-blue-100 opacity-40 pointer-events-none border-l-2 border-r-2 border-blue-300"
                              style={{
                                left: index * getColumnWidth(),
                                width: getColumnWidth(),
                                zIndex: 1
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                      
                      {/* Barre du projet - CORRECTION de l'alignement */}
                      {projetPhases.length > 0 && (
                        <div
                          className="absolute top-2 h-6 bg-blue-200 rounded opacity-50"
                          style={{
                            left: (normalizeDate(dateDebut).getTime() - normalizeDate(dateRange.start).getTime()) / (1000 * 60 * 60 * 24) * getColumnWidth(),
                            // CORRECTION: Ajouter 1 jour pour inclure la date de fin
                            width: Math.max(getColumnWidth(), ((normalizeDate(dateFin).getTime() - normalizeDate(dateDebut).getTime()) / (1000 * 60 * 60 * 24) + 1) * getColumnWidth()),
                            zIndex: 2
                          }}
                        />
                      )}
                      
                      {/* Jalons du projet */}
                      {ganttMilestones
                        .filter(milestone => milestone.projet.id === projet.id)
                        .map((milestone, milestoneIndex) => (
                          <div
                            key={`${milestone.jalon.id}-${milestoneIndex}`}
                            className="absolute top-1 h-8 w-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform z-10 flex items-center justify-center"
                            style={{
                              left: milestone.x - 16, // Centrer le jalon
                              backgroundColor: milestone.color,
                            }}
                            title={`${milestone.jalon.titre} - ${milestone.jalon.dateEcheance.toLocaleDateString()}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onJalonClick) {
                                onJalonClick(milestone.jalon);
                              }
                            }}
                          >
                            <Target className="h-4 w-4 text-white" />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Lignes des phases - Seules les phases dans la période sont affichées */}
                  {phasesByProjet[projet.id]?.map((bar, index) => (
                    <div key={bar.phase.id} className="flex items-center hover:bg-gray-50">
                      <div className="w-48 p-3 border-r pl-8 flex-shrink-0">
                        <div 
                          className="font-medium text-sm text-gray-800 cursor-pointer hover:text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPhaseClick?.(bar.phase, bar.projet);
                        }}
                        >
                          {bar.phase.nom}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bar.phase.creneaux && bar.phase.creneaux.length > 0 ? (
                            `${bar.phase.creneaux.length} créneau${bar.phase.creneaux.length > 1 ? 'x' : ''}`
                          ) : (
                            `${bar.phase.dateDebut.toLocaleDateString()} - ${bar.phase.dateFin.toLocaleDateString()}`
                          )}
                        </div>
                        {bar.phase.agents && bar.phase.agents.length > 0 && (
                          <div className="text-xs text-gray-400">
                            {bar.phase.agents.length} agent(s)
                          </div>
                        )}
                      </div>
                      <div className="flex relative" style={{ width: totalWidth, height: '32px' }}>
                        {/* Surbrillance de la colonne du jour actuel */}
                        {timelineDates.map((dateInfo, index) => {
                          if (dateInfo.isToday) {
                            return (
                              <div
                                key={`today-phase-${index}`}
                                className="absolute top-0 bottom-0 bg-blue-100 opacity-40 pointer-events-none border-l-2 border-r-2 border-blue-300"
                                style={{
                                  left: index * getColumnWidth(),
                                  width: getColumnWidth(),
                                  zIndex: 1
                                }}
                              />
                            );
                          }
                          return null;
                        })}
                        
                        {/* Affichage des créneaux multiples sur la même ligne */}
                        {bar.phase.creneaux && bar.phase.creneaux.length > 0 ? (
                          // Phase avec créneaux multiples
                          bar.phase.creneaux
                            .filter(creneau => {
                              const creneauStart = new Date(creneau.dateDebut);
                              const creneauEnd = new Date(creneau.dateFin);
                              return !(creneauEnd < dateRange.start || creneauStart > dateRange.end);
                            })
                            .map((creneau, creneauIndex) => {
                              const creneauStart = new Date(creneau.dateDebut);
                              const creneauEnd = new Date(creneau.dateFin);
                              const creneauStartNormalized = normalizeDate(creneauStart);
                              const creneauEndNormalized = normalizeDate(creneauEnd);
                              const timelineStartNormalized = normalizeDate(dateRange.start);
                              
                              const startOffset = (creneauStartNormalized.getTime() - timelineStartNormalized.getTime()) / (1000 * 60 * 60 * 24);
                              // CORRECTION: Ajouter 1 jour pour inclure la date de fin
                              const creneauDuration = Math.max(1, (creneauEndNormalized.getTime() - creneauStartNormalized.getTime()) / (1000 * 60 * 60 * 24) + 1);
                              
                              return (
                                <div
                                  key={`${bar.phase.id}-${creneau.id}`}
                                  className="absolute top-1 h-6 rounded shadow-sm border-l-2 border-r-2 cursor-pointer hover:shadow-md transition-shadow"
                                  style={{
                                    left: startOffset * getColumnWidth(),
                                    width: Math.max(getColumnWidth(), creneauDuration * getColumnWidth()),
                                    backgroundColor: creneau.couleur || bar.color,
                                    borderLeftColor: creneau.couleur || bar.color,
                                    borderRightColor: creneau.couleur || bar.color,
                                    zIndex: 2
                                  }}
                                  title={`${bar.phase.nom} - Créneau ${creneauIndex + 1} (${creneauStart.toLocaleDateString()} - ${creneauEnd.toLocaleDateString()})`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCreneauClick?.(creneau, bar.phase, bar.projet);
                                  }}
                                />
                              );
                            })
                        ) : (
                          // Phase sans créneaux (comportement legacy)
                          <div
                            className="absolute top-1 h-6 rounded shadow-sm border-l-2 border-r-2 cursor-pointer hover:shadow-md transition-shadow"
                            style={{
                              left: bar.startX,
                              // CORRECTION: Ajouter 1 jour pour inclure la date de fin
                              width: Math.max(getColumnWidth(), bar.width + getColumnWidth()),
                              backgroundColor: bar.color,
                              borderLeftColor: bar.color,
                              borderRightColor: bar.color,
                              zIndex: 2
                            }}
                            title={`${bar.phase.nom} (${bar.phase.dateDebut.toLocaleDateString()} - ${bar.phase.dateFin.toLocaleDateString()})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Créer un créneau fictif pour les phases sans créneaux
                              const creneauFictif = {
                                id: `phase-${bar.phase.id}`,
                                dateDebut: bar.phase.dateDebut,
                                dateFin: bar.phase.dateFin,
                                duree: bar.phase.duree,
                                couleur: bar.color
                              };
                              onCreneauClick?.(creneauFictif, bar.phase, bar.projet);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }).filter(Boolean)} {/* Filtrer les éléments null */}
          </div>
        </div>
      )}

      {/* Modales */}
      <JalonsManagerModal
        isOpen={isJalonsModalOpen}
        onClose={() => setIsJalonsModalOpen(false)}
        projet={filteredProjets.length === 1 ? filteredProjets[0] : null}
      />

    </div>
  );
}
