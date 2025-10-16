'use client';

import { useState } from 'react';
import { Calendar, Edit, Trash2, Clock, Users, MapPin, X, Building, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Projet } from '@/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ProjetModal } from './ProjetModal';

interface ProjectDetailsProps {
  projet: Projet;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (projet: Projet) => void;
  onDelete?: (projet: Projet) => void;
}

export function ProjectDetails({ 
  projet, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ProjectDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!isOpen) return null;

  const getDureeText = () => {
    if (!projet.dateDebut || !projet.dateFin) return 'Non définie';
    
    const debut = new Date(projet.dateDebut);
    const fin = new Date(projet.dateFin);
    const diffTime = Math.abs(fin.getTime() - debut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 jour';
    if (diffDays < 7) return `${diffDays} jours`;
    const semaines = Math.floor(diffDays / 7);
    const jours = diffDays % 7;
    if (jours === 0) return `${semaines} semaine${semaines > 1 ? 's' : ''}`;
    return `${semaines} semaine${semaines > 1 ? 's' : ''} et ${jours} jour${jours > 1 ? 's' : ''}`;
  };

  const isOverdue = () => {
    if (!projet.dateFin) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const finProjet = new Date(projet.dateFin);
    finProjet.setHours(0, 0, 0, 0);
    return finProjet < today;
  };

  const isCurrent = () => {
    if (!projet.dateDebut || !projet.dateFin) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const debutProjet = new Date(projet.dateDebut);
    debutProjet.setHours(0, 0, 0, 0);
    const finProjet = new Date(projet.dateFin);
    finProjet.setHours(0, 0, 0, 0);
    return debutProjet <= today && today <= finProjet;
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
      onDelete(projet);
    }
    setShowDeleteModal(false);
    onClose();
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (projetData: Omit<Projet, 'id' | 'createdAt' | 'updatedAt' | 'phases'>) => {
    // Convertir les données du formulaire en Projet complet
    const updatedProjet: Projet = {
      ...projet,
      ...projetData
    };
    
    if (onEdit) {
      onEdit(updatedProjet);
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
                  style={{ backgroundColor: projet.couleur || '#3B82F6' }}
                >
                  <Building className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{projet.nom}</CardTitle>
                  <p className="text-sm text-gray-600">Projet</p>
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
              {projet.dateDebut && projet.dateFin && (
                <>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {projet.dateDebut.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600">
                      {projet.dateFin.toLocaleDateString('fr-FR', {
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
                </>
              )}

              {/* Statut du projet */}
              <div className="flex items-center space-x-2">
                {getStatusBadge()}
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {projet.statut}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {projet.description && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{projet.description}</p>
              </div>
            )}

            {/* Informations client */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Client</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Nom:</span>
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

            {/* Phases du projet */}
            {projet.phases && projet.phases.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Phases</h4>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {projet.phases.length} phase{projet.phases.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {projet.phases.map((phase, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {phase.nom}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer le projet "${projet.nom}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Modal d'édition (réutilise ProjetModal existant) */}
      <ProjetModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        projet={projet}
        onSave={handleSaveEdit}
      />
    </>
  );
}
