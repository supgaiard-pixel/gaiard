'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Edit, Trash2, Calendar, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JalonProjet, TypeJalon, StatutJalonProjet, Projet } from '@/types';
import { usePlanningStore } from '@/store/usePlanningStore';
import { JalonModal } from './JalonModal';
import { JalonDetails } from './JalonDetails';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface JalonsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projet: Projet | null;
}

const typeJalonLabels: Record<TypeJalon, string> = {
  [TypeJalon.DEBUT_CHANTIER]: 'Début de chantier',
  [TypeJalon.FIN_PHASE_CRITIQUE]: 'Fin de phase critique',
  [TypeJalon.LIVRAISON_MATERIEL]: 'Livraison matériel',
  [TypeJalon.CONTROLE_TECHNIQUE]: 'Contrôle technique',
  [TypeJalon.MISE_EN_SERVICE]: 'Mise en service',
  [TypeJalon.RECEPTION_CLIENT]: 'Réception client',
  [TypeJalon.AUTRE]: 'Autre',
};

const statutJalonLabels: Record<StatutJalonProjet, string> = {
  [StatutJalonProjet.EN_ATTENTE]: 'En attente',
  [StatutJalonProjet.EN_COURS]: 'En cours',
  [StatutJalonProjet.TERMINE]: 'Terminé',
  [StatutJalonProjet.RETARDE]: 'Retardé',
  [StatutJalonProjet.ANNULE]: 'Annulé',
};

export function JalonsManagerModal({ isOpen, onClose, projet }: JalonsManagerModalProps) {
  const { jalons, loadJalons, deleteJalonFirebase } = usePlanningStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'titre' | 'statut'>('date');
  const [isJalonModalOpen, setIsJalonModalOpen] = useState(false);
  const [isJalonDetailsOpen, setIsJalonDetailsOpen] = useState(false);
  const [selectedJalon, setSelectedJalon] = useState<JalonProjet | null>(null);
  const [jalonToDelete, setJalonToDelete] = useState<JalonProjet | null>(null);

  // Charger les jalons du projet
  useEffect(() => {
    if (isOpen && projet) {
      loadJalons(projet.id);
    }
  }, [isOpen, projet, loadJalons]);

  // Filtrer et trier les jalons
  const filteredJalons = jalons
    .filter(jalon => jalon.projectId === projet?.id)
    .filter(jalon => {
      const matchesSearch = jalon.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          jalon.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || jalon.statut === statusFilter;
      const matchesType = typeFilter === 'all' || jalon.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
        case 'titre':
          return a.titre.localeCompare(b.titre);
        case 'statut':
          return a.statut.localeCompare(b.statut);
        default:
          return 0;
      }
    });

  // Statistiques des jalons
  const stats = {
    total: filteredJalons.length,
    enAttente: filteredJalons.filter(j => j.statut === StatutJalonProjet.EN_ATTENTE).length,
    enCours: filteredJalons.filter(j => j.statut === StatutJalonProjet.EN_COURS).length,
    termines: filteredJalons.filter(j => j.statut === StatutJalonProjet.TERMINE).length,
    retardes: filteredJalons.filter(j => j.statut === StatutJalonProjet.RETARDE).length,
    enRetard: filteredJalons.filter(j => {
      const today = new Date();
      const echeance = new Date(j.dateEcheance);
      return echeance < today && j.statut !== StatutJalonProjet.TERMINE;
    }).length
  };

  const handleNouveauJalon = () => {
    setSelectedJalon(null);
    setIsJalonModalOpen(true);
  };

  const handleEditJalon = (jalon: JalonProjet) => {
    setSelectedJalon(jalon);
    setIsJalonModalOpen(true);
  };

  const handleViewJalon = (jalon: JalonProjet) => {
    setSelectedJalon(jalon);
    setIsJalonDetailsOpen(true);
  };

  const handleDeleteJalon = (jalon: JalonProjet) => {
    setJalonToDelete(jalon);
  };

  const confirmDelete = async () => {
    if (jalonToDelete) {
      await deleteJalonFirebase(jalonToDelete.id);
      setJalonToDelete(null);
    }
  };

  const getStatutColor = (statut: StatutJalonProjet) => {
    switch (statut) {
      case StatutJalonProjet.EN_ATTENTE:
        return 'bg-yellow-100 text-yellow-800';
      case StatutJalonProjet.EN_COURS:
        return 'bg-blue-100 text-blue-800';
      case StatutJalonProjet.TERMINE:
        return 'bg-green-100 text-green-800';
      case StatutJalonProjet.RETARDE:
        return 'bg-red-100 text-red-800';
      case StatutJalonProjet.ANNULE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: StatutJalonProjet) => {
    switch (statut) {
      case StatutJalonProjet.EN_ATTENTE:
        return <Clock className="h-4 w-4" />;
      case StatutJalonProjet.EN_COURS:
        return <Clock className="h-4 w-4" />;
      case StatutJalonProjet.TERMINE:
        return <CheckCircle className="h-4 w-4" />;
      case StatutJalonProjet.RETARDE:
        return <AlertTriangle className="h-4 w-4" />;
      case StatutJalonProjet.ANNULE:
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (dateEcheance: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeance = new Date(dateEcheance);
    echeance.setHours(0, 0, 0, 0);
    return echeance < today;
  };

  if (!isOpen || !projet) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Card 
          className="w-full max-w-6xl bg-white shadow-xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">Gestion des jalons</CardTitle>
                  <p className="text-sm text-gray-600">{projet.nom}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-800">{stats.enAttente}</div>
                <div className="text-sm text-yellow-600">En attente</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.enCours}</div>
                <div className="text-sm text-blue-600">En cours</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{stats.termines}</div>
                <div className="text-sm text-green-600">Terminés</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-800">{stats.enRetard}</div>
                <div className="text-sm text-red-600">En retard</div>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Titre ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(statutJalonLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(typeJalonLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort">Trier par</Label>
                <Select value={sortBy} onValueChange={(value: 'date' | 'titre' | 'statut') => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date d'échéance</SelectItem>
                    <SelectItem value="titre">Titre</SelectItem>
                    <SelectItem value="statut">Statut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {filteredJalons.length} jalon{filteredJalons.length > 1 ? 's' : ''} trouvé{filteredJalons.length > 1 ? 's' : ''}
              </div>
              <Button onClick={handleNouveauJalon} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nouveau jalon</span>
              </Button>
            </div>

            {/* Liste des jalons */}
            <div className="space-y-3">
              {filteredJalons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun jalon trouvé</p>
                  <p className="text-sm">Créez votre premier jalon ou ajustez les filtres</p>
                </div>
              ) : (
                filteredJalons.map((jalon) => (
                  <div
                    key={jalon.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: jalon.couleur }}
                        >
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{jalon.titre}</h3>
                            {isOverdue(jalon.dateEcheance) && jalon.statut !== StatutJalonProjet.TERMINE && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                En retard
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{jalon.dateEcheance.toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getStatutIcon(jalon.statut)}
                              <span>{statutJalonLabels[jalon.statut]}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>{typeJalonLabels[jalon.type]}</span>
                            </div>
                          </div>
                          {jalon.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {jalon.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getStatutColor(jalon.statut)}>
                          {statutJalonLabels[jalon.statut]}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewJalon(jalon)}
                            className="h-8 w-8 p-0"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditJalon(jalon)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteJalon(jalon)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <JalonModal
        isOpen={isJalonModalOpen}
        onClose={() => setIsJalonModalOpen(false)}
        jalon={selectedJalon}
        projectId={projet.id}
        onSave={async () => {
          setIsJalonModalOpen(false);
          if (projet) {
            loadJalons(projet.id);
          }
        }}
      />

      <JalonDetails
        jalon={selectedJalon!}
        isOpen={isJalonDetailsOpen}
        onClose={() => setIsJalonDetailsOpen(false)}
        onEdit={handleEditJalon}
        onDelete={handleDeleteJalon}
      />

      <ConfirmationModal
        isOpen={!!jalonToDelete}
        onClose={() => setJalonToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer le jalon"
        message={`Êtes-vous sûr de vouloir supprimer le jalon "${jalonToDelete?.titre}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
}

