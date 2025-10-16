'use client';

import { useState } from 'react';
import { Target, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JalonProjet, StatutJalonProjet, TypeJalon } from '@/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface JalonListProps {
  jalons: JalonProjet[];
  onEditJalon: (jalon: JalonProjet) => void;
  onDeleteJalon: (jalon: JalonProjet) => void;
  onNouveauJalon: () => void;
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

export function JalonList({ jalons, onEditJalon, onDeleteJalon, onNouveauJalon }: JalonListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jalonToDelete, setJalonToDelete] = useState<JalonProjet | null>(null);

  const handleDeleteJalon = (jalon: JalonProjet) => {
    setJalonToDelete(jalon);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (jalonToDelete) {
      onDeleteJalon(jalonToDelete);
      setShowDeleteModal(false);
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

  const isOverdue = (dateEcheance: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeance = new Date(dateEcheance);
    echeance.setHours(0, 0, 0, 0);
    return echeance < today;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Jalons ({jalons.length})</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNouveauJalon}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>
      
      {jalons.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucun jalon défini
        </div>
      ) : (
        <div className="space-y-2">
          {jalons.map((jalon) => (
            <Card key={jalon.id} className="p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: jalon.couleur }}
                    />
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {jalon.titre}
                    </h4>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {jalon.dateEcheance.toLocaleDateString()}
                    {isOverdue(jalon.dateEcheance) && (
                      <span className="ml-2 text-red-600 font-medium">⚠️ En retard</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatutColor(jalon.statut)}`}>
                      {statutJalonLabels[jalon.statut]}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {typeJalonLabels[jalon.type]}
                    </span>
                  </div>
                  
                  {jalon.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {jalon.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditJalon(jalon)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteJalon(jalon)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer le jalon"
        message={`Êtes-vous sûr de vouloir supprimer le jalon "${jalonToDelete?.titre}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}

