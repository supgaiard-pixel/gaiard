'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Eye, 
  Download, 
  QrCode, 
  ExternalLink, 
  Calendar, 
  Users, 
  Filter,
  Plus,
  Search
} from 'lucide-react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Rapport, TypeRapport, PeriodeRapport, StatutRapport } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RapportModal } from './RapportModal';
import { PhotoGallery } from './PhotoGallery';

interface RapportListProps {
  projetId?: string;
  showFilters?: boolean;
}

const typeLabels: Record<TypeRapport, string> = {
  [TypeRapport.INTERVENTION]: 'Intervention',
  [TypeRapport.INCIDENCE]: 'Incidence',
  [TypeRapport.VISITE_CHANTIER]: 'Visite de chantier',
  [TypeRapport.REUNION]: 'Réunion',
  [TypeRapport.SECURITE]: 'Sécurité',
  [TypeRapport.QUALITE]: 'Qualité',
  [TypeRapport.MAINTENANCE]: 'Maintenance',
  [TypeRapport.RAPPORT_STAGE]: 'Rapport de stage',
  [TypeRapport.AUTRE]: 'Autre',
};

const periodeLabels: Record<PeriodeRapport, string> = {
  [PeriodeRapport.JOURNALIER]: 'Journalier',
  [PeriodeRapport.HEBDOMADAIRE]: 'Hebdomadaire',
  [PeriodeRapport.MENSUEL]: 'Mensuel',
  [PeriodeRapport.PONCTUEL]: 'Ponctuel',
};

const statutLabels: Record<StatutRapport, string> = {
  [StatutRapport.BROUILLON]: 'Brouillon',
  [StatutRapport.EN_ATTENTE_VALIDATION]: 'En attente',
  [StatutRapport.VALIDE]: 'Validé',
  [StatutRapport.REFUSE]: 'Refusé',
  [StatutRapport.ARCHIVE]: 'Archivé',
};

const statutColors: Record<StatutRapport, string> = {
  [StatutRapport.BROUILLON]: 'bg-gray-100 text-gray-800',
  [StatutRapport.EN_ATTENTE_VALIDATION]: 'bg-yellow-100 text-yellow-800',
  [StatutRapport.VALIDE]: 'bg-green-100 text-green-800',
  [StatutRapport.REFUSE]: 'bg-red-100 text-red-800',
  [StatutRapport.ARCHIVE]: 'bg-gray-100 text-gray-600',
};

export function RapportList({ projetId, showFilters = true }: RapportListProps) {
  const { 
    rapports, 
    projets, 
    agents, 
    filtresRapports, 
    setFiltresRapports,
    loadRapports,
    loadRapportsByProjet,
    generateRapportPDF,
    generateQRCode,
    deleteRapportFirebase
  } = usePlanningStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRapport, setSelectedRapport] = useState<Rapport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projetId) {
      loadRapportsByProjet(projetId);
    } else {
      loadRapports();
    }
  }, [projetId, loadRapports, loadRapportsByProjet]);

  // Filtrer les rapports
  const filteredRapports = rapports.filter(rapport => {
    // Filtre par projet si spécifié
    if (projetId && rapport.projetId !== projetId) return false;
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        rapport.titre.toLowerCase().includes(searchLower) ||
        rapport.description.toLowerCase().includes(searchLower) ||
        rapport.contenu.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtres avancés
    if (filtresRapports.types.length > 0 && !filtresRapports.types.includes(rapport.type)) return false;
    if (filtresRapports.statuts.length > 0 && !filtresRapports.statuts.includes(rapport.statut)) return false;
    if (filtresRapports.periodes.length > 0 && !filtresRapports.periodes.includes(rapport.periode)) return false;
    if (filtresRapports.projets.length > 0 && !filtresRapports.projets.includes(rapport.projetId)) return false;
    if (filtresRapports.agents.length > 0 && !rapport.agentsIds.some(id => filtresRapports.agents.includes(id))) return false;
    if (filtresRapports.isExterne !== undefined && rapport.isExterne !== filtresRapports.isExterne) return false;
    
    return true;
  });

  const handleCreateRapport = () => {
    setSelectedRapport(null);
    setIsModalOpen(true);
  };

  const handleEditRapport = (rapport: Rapport) => {
    setSelectedRapport(rapport);
    setIsModalOpen(true);
  };

  const handleViewRapport = (rapport: Rapport) => {
    setSelectedRapport(rapport);
    setIsViewerOpen(true);
  };

  const handleGeneratePDF = async (rapport: Rapport) => {
    try {
      setIsLoading(true);
      const pdfUrl = await generateRapportPDF(rapport.id);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQRCode = async (rapport: Rapport) => {
    try {
      setIsLoading(true);
      const qrCodeUrl = await generateQRCode(rapport.id);
      window.open(qrCodeUrl, '_blank');
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRapport = async (rapport: Rapport) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await deleteRapportFirebase(rapport.id);
      } catch (error) {
        console.error('Erreur lors de la suppression du rapport:', error);
      }
    }
  };

  const getProjetName = (projetId: string) => {
    const projet = projets.find(p => p.id === projetId);
    return projet?.nom || 'Projet inconnu';
  };

  const getAgentsNames = (agentsIds: string[]) => {
    return agentsIds
      .map(id => {
        const agent = agents.find(a => a.id === id);
        return agent ? `${agent.prenom} ${agent.nom}` : 'Agent inconnu';
      })
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rapports</h2>
          <p className="text-gray-600">
            {filteredRapports.length} rapport{filteredRapports.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreateRapport} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau rapport
        </Button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type */}
              <Select
                value={filtresRapports.types[0] || 'all'}
                onValueChange={(value) => 
                  setFiltresRapports({ 
                    types: value === 'all' ? [] : [value as TypeRapport] 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de rapport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Statut */}
              <Select
                value={filtresRapports.statuts[0] || 'all'}
                onValueChange={(value) => 
                  setFiltresRapports({ 
                    statuts: value === 'all' ? [] : [value as StatutRapport] 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statutLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Période */}
              <Select
                value={filtresRapports.periodes[0] || 'all'}
                onValueChange={(value) => 
                  setFiltresRapports({ 
                    periodes: value === 'all' ? [] : [value as PeriodeRapport] 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  {Object.entries(periodeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des rapports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRapports.map((rapport) => (
          <Card key={rapport.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{rapport.titre}</CardTitle>
                <div className="flex gap-1">
                  {rapport.isExterne && (
                    <Badge variant="outline" className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Externe
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{typeLabels[rapport.type]}</Badge>
                <Badge className={statutColors[rapport.statut]}>
                  {statutLabels[rapport.statut]}
                </Badge>
                <Badge variant="outline">{periodeLabels[rapport.periode]}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(rapport.dateRapport, 'dd/MM/yyyy', { locale: fr })}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{getAgentsNames(rapport.agentsIds)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Projet: {getProjetName(rapport.projetId)}
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2">
                {rapport.description}
              </p>

              {/* Photos */}
              {rapport.photos && rapport.photos.length > 0 && (
                <div className="mt-2">
                  <PhotoGallery photos={rapport.photos} rapportId={rapport.id} />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewRapport(rapport)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditRapport(rapport)}
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGeneratePDF(rapport)}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {rapport.isExterne && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateQRCode(rapport)}
                    disabled={isLoading}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRapports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filtresRapports).some(f => f.length > 0)
              ? 'Aucun rapport ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier rapport.'
            }
          </p>
          <Button onClick={handleCreateRapport}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un rapport
          </Button>
        </div>
      )}

      {/* Modal de création/édition */}
      <RapportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rapport={selectedRapport}
        projetId={projetId}
      />

      {/* Modal de visualisation */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedRapport?.titre}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRapport && (
            <div className="space-y-6">
              {/* Informations du rapport */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {typeLabels[selectedRapport.type]}</div>
                    <div><strong>Période:</strong> {periodeLabels[selectedRapport.periode]}</div>
                    <div><strong>Statut:</strong> 
                      <Badge className={`ml-2 ${statutColors[selectedRapport.statut]}`}>
                        {statutLabels[selectedRapport.statut]}
                      </Badge>
                    </div>
                    <div><strong>Date:</strong> {format(selectedRapport.dateRapport, 'dd/MM/yyyy', { locale: fr })}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contexte</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Projet:</strong> {getProjetName(selectedRapport.projetId)}</div>
                    <div><strong>Agents:</strong> {getAgentsNames(selectedRapport.agentsIds)}</div>
                    <div><strong>Type:</strong> {selectedRapport.isExterne ? 'Externe' : 'Interne'}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedRapport.description}</p>
              </div>

              {/* Contenu */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contenu détaillé</h4>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedRapport.contenu}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleGeneratePDF(selectedRapport)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger PDF
                </Button>
                {selectedRapport.isExterne && (
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateQRCode(selectedRapport)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    Générer QR Code
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
