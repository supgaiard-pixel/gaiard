'use client';

import { useState } from 'react';
import { Calendar, Edit, Trash2, Clock, Users, MapPin, X, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phase, Projet } from '@/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { PhaseModal } from './PhaseModal';

interface PhaseDetailsProps {
  phase: Phase;
  projet: Projet;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (phase: Phase) => void;
  onDelete?: (phase: Phase) => void;
}

export function PhaseDetails({ 
  phase, 
  projet, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: PhaseDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!isOpen) return null;

  const getDureeText = () => {
    const duree = phase.duree;
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
    const finPhase = new Date(phase.dateFin);
    finPhase.setHours(0, 0, 0, 0);
    return finPhase < today;
  };

  const isCurrent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const debutPhase = new Date(phase.dateDebut);
    debutPhase.setHours(0, 0, 0, 0);
    const finPhase = new Date(phase.dateFin);
    finPhase.setHours(0, 0, 0, 0);
    return debutPhase <= today && today <= finPhase;
  };

  const getStatusBadge = () => {
    if (isOverdue()) {
      return <Badge className="bg-red-100 text-red-800 text-xs">⚠️ En retard</Badge>;
    }
    if (isCurrent()) {
      return <Badge className="bg-blue-100 text-blue-800 text-xs">🔄 En cours</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 text-xs">✅ À venir</Badge>;
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(phase);
    }
    setShowDeleteModal(false);
    onClose();
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (phaseData: Omit<Phase, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Convertir les données du formulaire en Phase complète
    const updatedPhase: Phase = {
      ...phase,
      ...phaseData
    };
    
    if (onEdit) {
      onEdit(updatedPhase);
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
          className="w-full max-w-lg bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: phase.couleur || '#3B82F6' }}
                >
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{phase.nom}</CardTitle>
                  <p className="text-sm text-gray-600">Phase du projet</p>
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
                  {phase.dateDebut.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-sm text-gray-600">
                  {phase.dateFin.toLocaleDateString('fr-FR', {
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

              {/* Statut de la phase */}
              <div className="flex items-center space-x-2">
                {getStatusBadge()}
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {phase.statut}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {phase.description && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{phase.description}</p>
              </div>
            )}

            {/* Agents assignés */}
            {phase.agents && phase.agents.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Agents assignés</h4>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {phase.agents.length} agent{phase.agents.length > 1 ? 's' : ''} assigné{phase.agents.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {phase.agents.map((agentId, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • Agent ID: {agentId}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        title="Supprimer la phase"
        message={`Êtes-vous sûr de vouloir supprimer la phase "${phase.nom}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Modal d'édition (réutilise PhaseModal existant) */}
      <PhaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        phase={phase}
        projet={projet}
        onSave={handleSaveEdit}
      />
    </>
  );
}
