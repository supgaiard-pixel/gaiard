'use client';

import { useState } from 'react';
import { Calendar, Edit, Trash2, Clock, Users, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Creneau, Phase, Projet } from '@/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import CreneauEditModal from './CreneauEditModal';

interface CreneauDetailsProps {
  creneau: Creneau;
  phase: Phase;
  projet: Projet;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (creneau: Creneau, phase: Phase) => void;
  onDelete?: (creneau: Creneau, phase: Phase) => void;
}

export function CreneauDetails({ 
  creneau, 
  phase, 
  projet, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: CreneauDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!isOpen) return null;

  const getDureeText = () => {
    const duree = creneau.duree;
    if (duree === 1) return '1 jour';
    if (duree < 7) return `${duree} jours`;
    const semaines = Math.floor(duree / 7);
    const jours = duree % 7;
    if (jours === 0) return `${semaines} semaine${semaines > 1 ? 's' : ''}`;
    return `${semaines} semaine${semaines > 1 ? 's' : ''} et ${jours} jour${jours > 1 ? 's' : ''}`;
  };

  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const finCreneau = new Date(creneau.dateFin);
    finCreneau.setHours(0, 0, 0, 0);
    return finCreneau < today;
  };

  const isCurrent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const debutCreneau = new Date(creneau.dateDebut);
    debutCreneau.setHours(0, 0, 0, 0);
    const finCreneau = new Date(creneau.dateFin);
    finCreneau.setHours(0, 0, 0, 0);
    return debutCreneau <= today && today <= finCreneau;
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(creneau, phase);
    }
    setShowDeleteModal(false);
    onClose();
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedCreneau: Creneau, updatedPhase: Phase) => {
    if (onEdit) {
      onEdit(updatedCreneau, updatedPhase);
    }
    setShowEditModal(false);
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
                  style={{ backgroundColor: creneau.couleur || '#3B82F6' }}
                >
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Créneau de phase</CardTitle>
                  <p className="text-sm text-gray-600">{phase.nom}</p>
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

          <CardContent className="space-y-4">
            {/* Informations principales */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {creneau.dateDebut.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-sm text-gray-600">
                  {creneau.dateFin.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Durée: {getDureeText()}
                </span>
              </div>

              {/* Statut du créneau */}
              <div className="flex items-center space-x-2">
                {isOverdue() && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    ⚠️ En retard
                  </Badge>
                )}
                {isCurrent() && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    🔄 En cours
                  </Badge>
                )}
                {!isOverdue() && !isCurrent() && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    ✅ À venir
                  </Badge>
                )}
              </div>
            </div>

            {/* Informations de la phase */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Phase parente</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Nom:</span>
                  <span className="text-sm text-gray-600">{phase.nom}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <span className="text-sm text-gray-600">{phase.description || 'Aucune description'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut:</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {phase.statut}
                  </Badge>
                </div>
                {phase.agents && phase.agents.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {phase.agents.length} agent{phase.agents.length > 1 ? 's' : ''} assigné{phase.agents.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations du projet */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Projet</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Nom:</span>
                  <span className="text-sm text-gray-600">{projet.nom}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Client:</span>
                  <span className="text-sm text-gray-600">{projet.client}</span>
                </div>
                {projet.adresse && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{projet.adresse}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
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
        title="Supprimer le créneau"
        message={`Êtes-vous sûr de vouloir supprimer ce créneau de la phase "${phase.nom}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Modal d'édition */}
      <CreneauEditModal
        creneau={creneau}
        phase={phase}
        projet={projet}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
}
