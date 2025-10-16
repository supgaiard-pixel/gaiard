'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit, Calendar, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Projet, Phase, StatutProjet } from '@/types';
import { usePlanningStore } from '@/store/usePlanningStore';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { calculateProjectDates, calculateProjectDuration } from '@/utils/projectUtils';

interface ProjetCardProps {
  projet: Projet;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpanded: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNouvellePhase: () => void;
  onEditPhase: (phase: Phase) => void;
  onDeletePhase: (phase: Phase) => void;
  onNouveauJalon?: () => void;
}

export function ProjetCard({
  projet,
  isExpanded,
  isSelected,
  onToggleExpanded,
  onSelect,
  onEdit,
  onDelete,
  onNouvellePhase,
  onEditPhase,
  onDeletePhase,
  onNouveauJalon,
}: ProjetCardProps) {
  const { phases } = usePlanningStore();
  const [showDeleteProjetModal, setShowDeleteProjetModal] = useState(false);
  const [showDeletePhaseModal, setShowDeletePhaseModal] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null);
  
  // Filtrer les phases pour ce projet
  const projetPhases = phases.filter(phase => phase.projectId === projet.id);
  
  // Calculer les dates du projet à partir des phases
  const { dateDebut, dateFin } = calculateProjectDates(projetPhases);
  const dureeProjet = calculateProjectDuration(projetPhases);

  const handleDeleteProjet = () => {
    setShowDeleteProjetModal(true);
  };

  const handleConfirmDeleteProjet = () => {
    onDelete();
  };

  const handleDeletePhase = (phase: Phase) => {
    setPhaseToDelete(phase);
    setShowDeletePhaseModal(true);
  };

  const handleConfirmDeletePhase = () => {
    if (phaseToDelete) {
      onDeletePhase(phaseToDelete);
      setPhaseToDelete(null);
    }
  };

  const getStatutColor = (statut: StatutProjet) => {
    switch (statut) {
      case StatutProjet.EN_PREPARATION:
        return 'bg-yellow-100 text-yellow-800';
      case StatutProjet.EN_COURS:
        return 'bg-blue-100 text-blue-800';
      case StatutProjet.EN_PAUSE:
        return 'bg-orange-100 text-orange-800';
      case StatutProjet.TERMINE:
        return 'bg-green-100 text-green-800';
      case StatutProjet.ANNULE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: StatutProjet) => {
    switch (statut) {
      case StatutProjet.EN_PREPARATION:
        return 'En préparation';
      case StatutProjet.EN_COURS:
        return 'En cours';
      case StatutProjet.EN_PAUSE:
        return 'En pause';
      case StatutProjet.TERMINE:
        return 'Terminé';
      case StatutProjet.ANNULE:
        return 'Annulé';
      default:
        return statut;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Header du projet */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded();
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 truncate">{projet.nom}</h3>
              <p className="text-sm text-gray-500 truncate">{projet.client}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProjet();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statut et dates */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={getStatutColor(projet.statut)}>
            {getStatutLabel(projet.statut)}
          </Badge>
          <div className="text-xs text-gray-500">
            {projetPhases.length > 0 ? (
              <>
                {dateDebut.toLocaleDateString()} - {dateFin.toLocaleDateString()}
                <span className="ml-2 text-gray-400">({dureeProjet} jour{dureeProjet > 1 ? 's' : ''})</span>
              </>
            ) : (
              <span className="text-gray-400">Aucune phase définie</span>
            )}
          </div>
        </div>

        {/* Phases (si expandé) */}
        {isExpanded && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Phases ({projetPhases.length})</span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNouvellePhase();
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
                {onNouveauJalon && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNouveauJalon();
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Jalon
                  </Button>
                )}
              </div>
            </div>
            
            {projetPhases.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucune phase définie
              </div>
            ) : (
              <div className="space-y-1">
                {projetPhases.map((phase) => (
                  <div
                    key={phase.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPhase(phase);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: phase.couleur }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {phase.nom}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {phase.dateDebut.toLocaleDateString()} - {phase.dateFin.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-400">
                        {phase.agents.length} agent{phase.agents.length > 1 ? 's' : ''}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhase(phase);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Modales de confirmation */}
      <ConfirmationModal
        isOpen={showDeleteProjetModal}
        onClose={() => setShowDeleteProjetModal(false)}
        onConfirm={handleConfirmDeleteProjet}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer le projet "${projet.nom}" ? Cette action supprimera également toutes les phases associées et ne peut pas être annulée.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeletePhaseModal}
        onClose={() => {
          setShowDeletePhaseModal(false);
          setPhaseToDelete(null);
        }}
        onConfirm={handleConfirmDeletePhase}
        title="Supprimer la phase"
        message={`Êtes-vous sûr de vouloir supprimer la phase "${phaseToDelete?.nom}" ? Cette action ne peut pas être annulée.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </Card>
  );
}
