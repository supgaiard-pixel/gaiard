'use client';

import { useState } from 'react';
import { Filter, X, Calendar, Users, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatutProjet, StatutPhase, StatutJalonProjet, Agent } from '@/types';

interface TimelineFiltersProps {
  agents: Agent[];
  onFiltersChange: (filters: TimelineFiltersState) => void;
  initialFilters?: Partial<TimelineFiltersState>;
}

export interface TimelineFiltersState {
  // Filtres de projet
  projets: string[];
  statutsProjet: StatutProjet[];
  clients: string[];
  
  // Filtres de phase
  statutsPhase: StatutPhase[];
  agents: string[];
  
  // Filtres de jalon
  statutsJalon: StatutJalonProjet[];
  typesJalon: string[];
  jalonsEnRetard: boolean;
  
  // Filtres temporels
  dateDebut?: Date;
  dateFin?: Date;
  
  // Filtres de recherche
  recherche: string;
  
  // Options d'affichage
  afficherProjetsSansPhases: boolean;
  afficherJalonsSeulement: boolean;
  afficherRetardsSeulement: boolean;
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

export function TimelineFilters({ agents, onFiltersChange, initialFilters }: TimelineFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    ...initialFilters
  });

  const [dateDebutOpen, setDateDebutOpen] = useState(false);
  const [dateFinOpen, setDateFinOpen] = useState(false);

  const handleFilterChange = (key: keyof TimelineFiltersState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (key: keyof TimelineFiltersState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    const clearedFilters: TimelineFiltersState = {
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
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.projets.length > 0) count++;
    if (filters.statutsProjet.length > 0) count++;
    if (filters.clients.length > 0) count++;
    if (filters.statutsPhase.length > 0) count++;
    if (filters.agents.length > 0) count++;
    if (filters.statutsJalon.length > 0) count++;
    if (filters.typesJalon.length > 0) count++;
    if (filters.jalonsEnRetard) count++;
    if (filters.dateDebut) count++;
    if (filters.dateFin) count++;
    if (filters.recherche) count++;
    if (!filters.afficherProjetsSansPhases) count++;
    if (filters.afficherJalonsSeulement) count++;
    if (filters.afficherRetardsSeulement) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtres de la timeline</CardTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Effacer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recherche globale */}
              <div>
                <Label htmlFor="recherche">Recherche</Label>
                <Input
                  id="recherche"
                  placeholder="Rechercher dans les projets, phases, jalons..."
                  value={filters.recherche}
                  onChange={(e) => handleFilterChange('recherche', e.target.value)}
                />
              </div>

              {/* Filtres temporels */}
              <div>
                <Label>Période</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Popover open={dateDebutOpen} onOpenChange={setDateDebutOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filters.dateDebut ? format(filters.dateDebut, 'dd/MM/yyyy', { locale: fr }) : 'Début'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateDebut}
                          onSelect={(date) => {
                            handleFilterChange('dateDebut', date);
                            setDateDebutOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Popover open={dateFinOpen} onOpenChange={setDateFinOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filters.dateFin ? format(filters.dateFin, 'dd/MM/yyyy', { locale: fr }) : 'Fin'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateFin}
                          onSelect={(date) => {
                            handleFilterChange('dateFin', date);
                            setDateFinOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Statuts de projet */}
              <div>
                <Label>Statuts de projet</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(statutProjetLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`statut-projet-${key}`}
                        checked={filters.statutsProjet.includes(key as StatutProjet)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('statutsProjet', key, checked as boolean)
                        }
                      />
                      <Label htmlFor={`statut-projet-${key}`} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statuts de phase */}
              <div>
                <Label>Statuts de phase</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(statutPhaseLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`statut-phase-${key}`}
                        checked={filters.statutsPhase.includes(key as StatutPhase)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('statutsPhase', key, checked as boolean)
                        }
                      />
                      <Label htmlFor={`statut-phase-${key}`} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agents */}
              <div>
                <Label>Agents</Label>
                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={filters.agents.includes(agent.id)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('agents', agent.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`agent-${agent.id}`} className="text-sm">
                        {agent.prenom} {agent.nom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statuts de jalon */}
              <div>
                <Label>Statuts de jalon</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(statutJalonLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`statut-jalon-${key}`}
                        checked={filters.statutsJalon.includes(key as StatutJalonProjet)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('statutsJalon', key, checked as boolean)
                        }
                      />
                      <Label htmlFor={`statut-jalon-${key}`} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options spéciales */}
              <div>
                <Label>Options spéciales</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jalons-en-retard"
                      checked={filters.jalonsEnRetard}
                      onCheckedChange={(checked) => handleFilterChange('jalonsEnRetard', checked)}
                    />
                    <Label htmlFor="jalons-en-retard" className="text-sm flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Jalons en retard uniquement</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projets-sans-phases"
                      checked={filters.afficherProjetsSansPhases}
                      onCheckedChange={(checked) => handleFilterChange('afficherProjetsSansPhases', checked)}
                    />
                    <Label htmlFor="projets-sans-phases" className="text-sm">
                      Afficher projets sans phases
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jalons-seulement"
                      checked={filters.afficherJalonsSeulement}
                      onCheckedChange={(checked) => handleFilterChange('afficherJalonsSeulement', checked)}
                    />
                    <Label htmlFor="jalons-seulement" className="text-sm flex items-center space-x-1">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span>Jalons seulement</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}

