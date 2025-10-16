'use client';

import { useState, useMemo } from 'react';
import { Search, X, Filter, Target, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Projet, Phase, JalonProjet, Agent } from '@/types';

interface TimelineSearchProps {
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  agents: Agent[];
  onResultClick?: (result: SearchResult) => void;
}

export interface SearchResult {
  id: string;
  type: 'projet' | 'phase' | 'jalon' | 'agent';
  title: string;
  description: string;
  metadata: {
    projet?: string;
    statut?: string;
    date?: string;
    agents?: string[];
  };
  item: Projet | Phase | JalonProjet | Agent;
}

export function TimelineSearch({ projets, phases, jalons, agents, onResultClick }: TimelineSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Index de recherche
  const searchIndex = useMemo(() => {
    const index: SearchResult[] = [];

    // Indexer les projets
    projets.forEach(projet => {
      index.push({
        id: `projet_${projet.id}`,
        type: 'projet',
        title: projet.nom,
        description: projet.description,
        metadata: {
          statut: projet.statut,
          date: `${projet.dateDebut.toLocaleDateString('fr-FR')} - ${projet.dateFin.toLocaleDateString('fr-FR')}`,
        },
        item: projet,
      });
    });

    // Indexer les phases
    phases.forEach(phase => {
      const projet = projets.find(p => p.id === phase.projectId);
      index.push({
        id: `phase_${phase.id}`,
        type: 'phase',
        title: phase.nom,
        description: phase.description,
        metadata: {
          projet: projet?.nom,
          statut: phase.statut,
          date: `${phase.dateDebut.toLocaleDateString('fr-FR')} - ${phase.dateFin.toLocaleDateString('fr-FR')}`,
          agents: phase.agentsDetails?.map(a => `${a.prenom} ${a.nom}`) || [],
        },
        item: phase,
      });
    });

    // Indexer les jalons
    jalons.forEach(jalon => {
      const projet = projets.find(p => p.id === jalon.projectId);
      index.push({
        id: `jalon_${jalon.id}`,
        type: 'jalon',
        title: jalon.titre,
        description: jalon.description,
        metadata: {
          projet: projet?.nom,
          statut: jalon.statut,
          date: jalon.dateEcheance.toLocaleDateString('fr-FR'),
        },
        item: jalon,
      });
    });

    // Indexer les agents
    agents.forEach(agent => {
      index.push({
        id: `agent_${agent.id}`,
        type: 'agent',
        title: `${agent.prenom} ${agent.nom}`,
        description: agent.email,
        metadata: {
          statut: agent.actif ? 'Actif' : 'Inactif',
        },
        item: agent,
      });
    });

    return index;
  }, [projets, phases, jalons, agents]);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results = searchIndex.filter(item => {
      // Filtre par type
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Recherche dans le titre et la description
      const matchesTitle = item.title.toLowerCase().includes(term);
      const matchesDescription = item.description.toLowerCase().includes(term);
      const matchesMetadata = Object.values(item.metadata).some(value => {
        if (Array.isArray(value)) {
          return value.some(v => v.toLowerCase().includes(term));
        }
        return value?.toLowerCase().includes(term);
      });

      return matchesTitle || matchesDescription || matchesMetadata;
    });

    // Trier par pertinence
    return results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(term);
      const bTitleMatch = b.title.toLowerCase().includes(term);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      return a.title.localeCompare(b.title);
    });
  }, [searchTerm, selectedType, searchIndex]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'projet':
        return <Calendar className="h-4 w-4" />;
      case 'phase':
        return <Calendar className="h-4 w-4" />;
      case 'jalon':
        return <Target className="h-4 w-4" />;
      case 'agent':
        return <Users className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'projet':
        return 'bg-blue-100 text-blue-800';
      case 'phase':
        return 'bg-green-100 text-green-800';
      case 'jalon':
        return 'bg-red-100 text-red-800';
      case 'agent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'projet':
        return 'Projet';
      case 'phase':
        return 'Phase';
      case 'jalon':
        return 'Jalon';
      case 'agent':
        return 'Agent';
      default:
        return type;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedType('all');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Rechercher</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Recherche avancée</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barre de recherche */}
            <div className="space-y-2">
              <Input
                placeholder="Rechercher dans les projets, phases, jalons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              {/* Filtres par type */}
              <div className="flex flex-wrap gap-1">
                {['all', 'projet', 'phase', 'jalon', 'agent'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="text-xs"
                  >
                    {type === 'all' ? 'Tous' : getTypeLabel(type)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Résultats */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchTerm.trim() === '' ? (
                <div className="text-center py-4 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Tapez pour rechercher</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun résultat trouvé</p>
                  <p className="text-xs text-gray-400">Essayez d'autres mots-clés</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Effacer
                      </Button>
                    )}
                  </div>
                  
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${getTypeColor(result.type)}`}>
                          {getTypeIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          
                          {result.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          
                          <div className="space-y-1">
                            {result.metadata.projet && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Projet:</span> {result.metadata.projet}
                              </div>
                            )}
                            {result.metadata.statut && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Statut:</span> {result.metadata.statut}
                              </div>
                            )}
                            {result.metadata.date && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Date:</span> {result.metadata.date}
                              </div>
                            )}
                            {result.metadata.agents && result.metadata.agents.length > 0 && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Agents:</span> {result.metadata.agents.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

