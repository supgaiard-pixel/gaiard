'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, FolderOpen, ChevronDown, ChevronRight, Target, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/components/FirebaseProvider';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Projet, Phase, StatutProjet, JalonProjet } from '@/types';
import { ProjetCard } from '@/components/timeline/ProjetCard';
import { ProjetModal } from '@/components/timeline/ProjetModal';
import { PhaseModal } from '@/components/timeline/PhaseModal';
import { JalonModal } from '@/components/timeline/JalonModal';
import { JalonList } from '@/components/timeline/JalonList';
import { JalonDetails } from '@/components/timeline/JalonDetails';
import { GanttChart } from '@/components/timeline/GanttChart';
import { TimelineZoom } from '@/components/timeline/TimelineZoom';
import { TimelineDragDrop } from '@/components/timeline/TimelineDragDrop';
import { TimelineReportsIntegration } from '@/components/timeline/TimelineReportsIntegration';
import { CreneauDetails } from '@/components/timeline/CreneauDetails';
import { PhaseDetails } from '@/components/timeline/PhaseDetails';
import { ProjectDetails } from '@/components/timeline/ProjectDetails';

export default function TimelinePage() {
  const { isInitialized, error } = useFirebase();
  const { 
    projets, 
    phases, 
    jalons,
    loadProjets, 
    loadPhases, 
    loadJalons,
    saveProjet, 
    savePhase, 
    saveJalon,
    updateProjetFirebase, 
    updatePhaseFirebase, 
    updateJalonFirebase,
    deleteProjetFirebase, 
    deletePhaseFirebase,
    deleteJalonFirebase
  } = usePlanningStore();
  
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [expandedProjets, setExpandedProjets] = useState<Set<string>>(new Set());
  const [isProjetModalOpen, setIsProjetModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isJalonModalOpen, setIsJalonModalOpen] = useState(false);
  const [isJalonDetailsOpen, setIsJalonDetailsOpen] = useState(false);
  const [selectedProjetForPhase, setSelectedProjetForPhase] = useState<Projet | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedJalon, setSelectedJalon] = useState<JalonProjet | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showDragDrop, setShowDragDrop] = useState(false);
  const [showReportsIntegration, setShowReportsIntegration] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // États pour les modals de détails
  const [selectedCreneau, setSelectedCreneau] = useState<{
    creneau: any;
    phase: Phase;
    projet: Projet;
  } | null>(null);
  const [isCreneauDetailsOpen, setIsCreneauDetailsOpen] = useState(false);
  
  const [selectedPhaseDetails, setSelectedPhaseDetails] = useState<{
    phase: Phase;
    projet: Projet;
  } | null>(null);
  const [isPhaseDetailsOpen, setIsPhaseDetailsOpen] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);

  // Charger les projets et leurs phases depuis Firebase
  useEffect(() => {
    if (isInitialized) {
      loadProjets();
    }
  }, [isInitialized, loadProjets]);

  // Charger les phases et jalons pour chaque projet
  useEffect(() => {
    if (isInitialized && projets.length > 0) {
      projets.forEach(projet => {
        loadPhases(projet.id);
        loadJalons(projet.id);
      });
    }
  }, [isInitialized, projets, loadPhases, loadJalons]);


  const handleToggleExpanded = (projetId: string) => {
    const newExpanded = new Set(expandedProjets);
    if (newExpanded.has(projetId)) {
      newExpanded.delete(projetId);
    } else {
      newExpanded.add(projetId);
    }
    setExpandedProjets(newExpanded);
  };

  const handleNouveauProjet = () => {
    setSelectedProjet(null);
    setIsProjetModalOpen(true);
  };

  const handleEditProjet = (projet: Projet) => {
    setSelectedProjet(projet);
    setIsProjetModalOpen(true);
  };

  const handleNouvellePhase = (projet: Projet) => {
    setSelectedProjetForPhase(projet);
    setSelectedPhase(null);
    setIsPhaseModalOpen(true);
  };

  const handleEditPhase = (phase: Phase, projet: Projet) => {
    setSelectedPhase(phase);
    setSelectedProjetForPhase(projet);
    setIsPhaseModalOpen(true);
  };

  const handleNouveauJalon = (projet: Projet) => {
    setSelectedProjetForPhase(projet);
    setSelectedJalon(null);
    setIsJalonModalOpen(true);
  };

  const handleEditJalon = (jalon: JalonProjet, projet: Projet) => {
    setSelectedJalon(jalon);
    setSelectedProjetForPhase(projet);
    setIsJalonModalOpen(true);
  };

  const handleJalonClick = (jalon: JalonProjet) => {
    setSelectedJalon(jalon);
    setIsJalonDetailsOpen(true);
  };

  const handleEditJalonFromDetails = (jalon: JalonProjet) => {
    setIsJalonDetailsOpen(false);
    setSelectedJalon(jalon);
    setSelectedProjetForPhase(projets.find(p => p.id === jalon.projectId) || null);
    setIsJalonModalOpen(true);
  };

  const handleSelectProjet = (projet: Projet) => {
    setSelectedProjet(projet);
  };

  // Afficher un message de chargement ou d'erreur
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de Firebase...</p>
        </div>
      </div>
    );
  }

  const handleSaveProjet = async (projet: Omit<Projet, 'id' | 'createdAt' | 'updatedAt' | 'phases'>) => {
    try {
      if (selectedProjet) {
        // Mise à jour
        await updateProjetFirebase(selectedProjet.id, projet);
      } else {
        // Création
        await saveProjet(projet);
      }
      setIsProjetModalOpen(false);
      setSelectedProjet(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
    }
  };

  const handleSavePhase = async (phase: Omit<Phase, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedPhase) {
        // Mise à jour
        await updatePhaseFirebase(selectedPhase.id, phase);
      } else {
        // Création
        await savePhase(phase);
      }
      setIsPhaseModalOpen(false);
      setSelectedPhase(null);
      setSelectedProjetForPhase(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la phase:', error);
    }
  };

  const handleDeleteProjet = async (projet: Projet) => {
    try {
      await deleteProjetFirebase(projet.id);
      if (selectedProjet?.id === projet.id) {
        setSelectedProjet(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };

  const handleDeletePhase = async (phase: Phase) => {
    try {
      await deletePhaseFirebase(phase.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la phase:', error);
    }
  };

  const handleSaveJalon = async (jalon: Omit<JalonProjet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedJalon) {
        // Mise à jour
        await updateJalonFirebase(selectedJalon.id, jalon);
      } else {
        // Création
        await saveJalon(jalon);
      }
      setIsJalonModalOpen(false);
      setSelectedJalon(null);
      setSelectedProjetForPhase(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du jalon:', error);
    }
  };

  const handleDeleteJalon = async (jalon: JalonProjet) => {
    try {
      await deleteJalonFirebase(jalon.id);
    } catch (error) {
      console.error('Erreur lors de la suppression du jalon:', error);
    }
  };

  // Fonctions pour les modals de détails
  const handleCreneauClick = (creneau: any, phase: Phase, projet: Projet) => {
    setSelectedCreneau({ creneau, phase, projet });
    setIsCreneauDetailsOpen(true);
  };

  const handleCreneauEdit = async (creneau: any, phase: Phase) => {
    try {
      // Mettre à jour le créneau dans la phase
      const updatedCreneaux = phase.creneaux.map(c => 
        c.id === creneau.id ? creneau : c
      );
      
      const updatedPhase = {
        ...phase,
        creneaux: updatedCreneaux
      };
      
      await updatePhaseFirebase(phase.id, updatedPhase);
      console.log('Créneau mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du créneau:', error);
    }
  };

  const handleCreneauDelete = async (creneau: any, phase: Phase) => {
    try {
      // Supprimer le créneau de la phase
      const updatedCreneaux = phase.creneaux.filter(c => c.id !== creneau.id);
      
      const updatedPhase = {
        ...phase,
        creneaux: updatedCreneaux
      };
      
      await updatePhaseFirebase(phase.id, updatedPhase);
      console.log('Créneau supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du créneau:', error);
    }
  };

  const handlePhaseClick = (phase: Phase, projet: Projet) => {
    setSelectedPhaseDetails({ phase, projet });
    setIsPhaseDetailsOpen(true);
  };

  const handlePhaseEdit = async (phase: Phase) => {
    try {
      await updatePhaseFirebase(phase.id, phase);
      console.log('Phase mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la phase:', error);
    }
  };

  const handlePhaseDelete = async (phase: Phase) => {
    try {
      await deletePhaseFirebase(phase.id);
      console.log('Phase supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la phase:', error);
    }
  };

  const handleProjectClick = (projet: Projet) => {
    setSelectedProject(projet);
    setIsProjectDetailsOpen(true);
  };

  const handleProjectEdit = async (projet: Projet) => {
    try {
      await updateProjetFirebase(projet.id, projet);
      console.log('Projet mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  const handleProjectDelete = async (projet: Projet) => {
    try {
      await deleteProjetFirebase(projet.id);
      console.log('Projet supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Erreur Firebase</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar des projets */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
        {/* Header */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Project Timeline
              </h1>
              <Button onClick={handleNouveauProjet} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Projet
              </Button>
            </div>
          </div>
        )}

        {/* Liste des projets */}
        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-4">
          {projets.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun projet
                </h3>
                <p className="text-gray-600 mb-4">
                  Commencez par créer votre premier projet
                </p>
                <Button onClick={handleNouveauProjet}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un projet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {projets.map((projet) => (
                  <ProjetCard
                    key={projet.id}
                    projet={projet}
                    isExpanded={expandedProjets.has(projet.id)}
                    isSelected={selectedProjet?.id === projet.id}
                    onToggleExpanded={() => handleToggleExpanded(projet.id)}
                    onSelect={() => handleSelectProjet(projet)}
                    onEdit={() => handleEditProjet(projet)}
                    onDelete={() => handleDeleteProjet(projet)}
                    onNouvellePhase={() => handleNouvellePhase(projet)}
                    onEditPhase={(phase) => handleEditPhase(phase, projet)}
                    onDeletePhase={handleDeletePhase}
                    onNouveauJalon={() => handleNouveauJalon(projet)}
                  />
                ))}
              </div>
              
              {/* Liste des jalons pour le projet sélectionné */}
              {selectedProjet && (
                <div className="border-t pt-4">
                  <JalonList
                    jalons={jalons.filter(jalon => jalon.projectId === selectedProjet.id)}
                    onEditJalon={(jalon) => handleEditJalon(jalon, selectedProjet)}
                    onDeleteJalon={handleDeleteJalon}
                    onNouveauJalon={() => handleNouveauJalon(selectedProjet)}
                  />
                </div>
              )}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Zone principale - Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Bouton toggle pour la sidebar */}
        <div className="bg-white border-b border-gray-200 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2"
          >
            {isSidebarOpen ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                Masquer les projets
              </>
            ) : (
              <>
                <ChevronRightIcon className="h-4 w-4" />
                Afficher les projets
              </>
            )}
          </Button>
        </div>
        {selectedProjet ? (
          <div className="flex-1 flex flex-col">
            {/* Contrôles de zoom */}
            <div className="p-4 border-b bg-gray-50">
              <TimelineZoom
                onZoomChange={setZoom}
                onReset={() => setZoom(1)}
                onFitToScreen={() => setZoom(1)}
                initialZoom={zoom}
              />
            </div>
            
            {/* Timeline principale */}
            <div className="flex-1" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <GanttChart 
                projets={projets} 
                onJalonClick={handleJalonClick}
                onCreneauClick={handleCreneauClick}
                onPhaseClick={handlePhaseClick}
                onProjectClick={handleProjectClick}
              />
            </div>
            
            {/* Panneau latéral pour outils avancés */}
            <div className="border-t bg-white">
              <div className="flex space-x-2 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDragDrop(!showDragDrop)}
                  className={showDragDrop ? 'bg-blue-50 border-blue-300' : ''}
                >
                  Réorganiser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportsIntegration(!showReportsIntegration)}
                  className={showReportsIntegration ? 'bg-green-50 border-green-300' : ''}
                >
                  Rapports
                </Button>
              </div>
              
              {/* Panneau de réorganisation */}
              {showDragDrop && (
                <div className="border-t p-4 bg-gray-50">
                  <TimelineDragDrop
                    phases={phases.filter(p => p.projectId === selectedProjet.id)}
                    jalons={jalons.filter(j => j.projectId === selectedProjet.id)}
                    onReorder={(type, itemId, newOrder) => {
                      console.log('Réorganiser:', type, itemId, newOrder);
                      // TODO: Implémenter la réorganisation
                    }}
                    onMove={(type, itemId, direction) => {
                      console.log('Déplacer:', type, itemId, direction);
                      // TODO: Implémenter le déplacement
                    }}
                  />
                </div>
              )}
              
              {/* Panneau d'intégration des rapports */}
              {showReportsIntegration && (
                <div className="border-t p-4 bg-gray-50">
                  <TimelineReportsIntegration
                    projet={selectedProjet}
                    phases={phases.filter(p => p.projectId === selectedProjet.id)}
                    jalons={jalons.filter(j => j.projectId === selectedProjet.id)}
                    onRapportClick={(rapport) => {
                      console.log('Ouvrir rapport:', rapport);
                      // TODO: Ouvrir le rapport
                    }}
                    onNouveauRapport={(projetId, phaseId, jalonId) => {
                      console.log('Nouveau rapport:', projetId, phaseId, jalonId);
                      // TODO: Ouvrir le modal de création de rapport
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez un projet
              </h3>
              <p className="text-gray-600">
                Choisissez un projet dans la sidebar pour voir sa timeline
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <ProjetModal
        isOpen={isProjetModalOpen}
        onClose={() => setIsProjetModalOpen(false)}
        projet={selectedProjet}
        onSave={handleSaveProjet}
      />

      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        phase={selectedPhase}
        projet={selectedProjetForPhase}
        onSave={handleSavePhase}
      />

      <JalonModal
        isOpen={isJalonModalOpen}
        onClose={() => setIsJalonModalOpen(false)}
        jalon={selectedJalon}
        projectId={selectedProjetForPhase?.id || ''}
        onSave={handleSaveJalon}
      />

      <JalonDetails
        jalon={selectedJalon!}
        isOpen={isJalonDetailsOpen && selectedJalon !== null}
        onClose={() => setIsJalonDetailsOpen(false)}
        onEdit={handleEditJalonFromDetails}
        onDelete={handleDeleteJalon}
      />

      {/* Modals de détails */}
      {selectedCreneau && (
        <CreneauDetails
          creneau={selectedCreneau.creneau}
          phase={selectedCreneau.phase}
          projet={selectedCreneau.projet}
          isOpen={isCreneauDetailsOpen}
          onClose={() => setIsCreneauDetailsOpen(false)}
          onEdit={handleCreneauEdit}
          onDelete={handleCreneauDelete}
        />
      )}

      {selectedPhaseDetails && (
        <PhaseDetails
          phase={selectedPhaseDetails.phase}
          projet={selectedPhaseDetails.projet}
          isOpen={isPhaseDetailsOpen}
          onClose={() => setIsPhaseDetailsOpen(false)}
          onEdit={handlePhaseEdit}
          onDelete={handlePhaseDelete}
        />
      )}

      {selectedProject && (
        <ProjectDetails
          projet={selectedProject}
          isOpen={isProjectDetailsOpen}
          onClose={() => setIsProjectDetailsOpen(false)}
          onEdit={handleProjectEdit}
          onDelete={handleProjectDelete}
        />
      )}
    </div>
  );
}
