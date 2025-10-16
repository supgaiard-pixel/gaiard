'use client';

import { useState } from 'react';
import { Target, Edit, Trash2, Calendar, Tag, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JalonProjet, TypeJalon, StatutJalonProjet } from '@/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface JalonDetailsProps {
  jalon: JalonProjet;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (jalon: JalonProjet) => void;
  onDelete: (jalon: JalonProjet) => void;
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

export function JalonDetails({ jalon, isOpen, onClose, onEdit, onDelete }: JalonDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!isOpen) return null;

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

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(jalon);
    setShowDeleteModal(false);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Card 
          className="w-full max-w-md bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: jalon.couleur }}
                >
                  <Target className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg">{jalon.titre}</CardTitle>
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

          <CardContent className="space-y-4">
            {/* Informations principales */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {jalon.dateEcheance.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {isOverdue(jalon.dateEcheance) && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    ⚠️ En retard
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {typeJalonLabels[jalon.type]}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className={getStatutColor(jalon.statut)}>
                  {statutJalonLabels[jalon.statut]}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {jalon.description && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Description</span>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {jalon.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(jalon)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer le jalon"
        message={`Êtes-vous sûr de vouloir supprimer le jalon "${jalon.titre}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
}

