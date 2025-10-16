'use client';

import { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Hash, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Phase, Projet, StatutPhase, Agent, Creneau } from '@/types';
import { agentService } from '@/services/firebaseService';
import { calculatePhaseDates, createDefaultCreneau } from '@/utils/projectUtils';

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase?: Phase | null;
  projet?: Projet | null;
  onSave: (phase: Omit<Phase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function PhaseModal({ isOpen, onClose, phase, projet, onSave }: PhaseModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    statut: StatutPhase.EN_ATTENTE,
    agents: [] as string[],
    ordre: 0,
    couleur: '#10B981',
  });

  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAgents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase && projet) {
      setFormData({
        nom: phase.nom,
        description: phase.description,
        statut: phase.statut,
        agents: phase.agents,
        ordre: phase.ordre,
        couleur: phase.couleur,
      });
      setCreneaux(phase.creneaux || []);
    } else if (projet) {
      // Nouvelle phase - calculer l'ordre automatiquement
      const nextOrdre = projet.phases.length;
      setFormData({
        nom: '',
        description: '',
        statut: StatutPhase.EN_ATTENTE,
        agents: [],
        ordre: nextOrdre,
        couleur: '#10B981',
      });
      // Créer un créneau par défaut
      const defaultCreneau = createDefaultCreneau(projet.dateDebut, projet.dateFin);
      setCreneaux([defaultCreneau]);
    }
  }, [phase, projet, isOpen]);

  const loadAgents = async () => {
    try {
      const agentsData = await agentService.getAll();
      setAgents(agentsData.filter(agent => agent.actif));
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projet) return;

    setIsLoading(true);

    try {
      // Calculer les dates de la phase à partir des créneaux
      const { dateDebut, dateFin, duree } = calculatePhaseDates(creneaux);
      
      const phaseData = {
        ...formData,
        projectId: projet.id,
        dateDebut,
        dateFin,
        duree,
        creneaux,
      };

      await onSave(phaseData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la phase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgentToggle = (agentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agents: checked 
        ? [...prev.agents, agentId]
        : prev.agents.filter(id => id !== agentId)
    }));
  };

  // Fonctions pour gérer les créneaux
  const addCreneau = () => {
    const newCreneau = createDefaultCreneau(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setCreneaux(prev => [...prev, newCreneau]);
  };

  const removeCreneau = (creneauId: string) => {
    setCreneaux(prev => prev.filter(c => c.id !== creneauId));
  };

  const updateCreneau = (creneauId: string, field: keyof Creneau, value: any) => {
    setCreneaux(prev => prev.map(c => 
      c.id === creneauId 
        ? { 
            ...c, 
            [field]: value,
            ...(field === 'dateDebut' || field === 'dateFin' ? {
              duree: Math.ceil((new Date(field === 'dateDebut' ? value : c.dateDebut).getTime() - new Date(field === 'dateFin' ? value : c.dateFin).getTime()) / (1000 * 60 * 60 * 24))
            } : {})
          }
        : c
    ));
  };

  if (!isOpen || !projet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {phase ? 'Modifier la phase' : 'Nouvelle phase'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Projet: {projet.nom}</h3>
            <p className="text-sm text-blue-700">{projet.client}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom de la phase */}
            <div className="md:col-span-2">
              <Label htmlFor="nom">Nom de la phase *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Ex: Installation modules, Structure, Local technique..."
                required
              />
            </div>

            {/* Créneaux de travail */}
            <div className="md:col-span-2">
              <Label className="flex items-center justify-between mb-3">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Créneaux de travail
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCreneau}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un créneau</span>
                </Button>
              </Label>
              
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {creneaux.map((creneau, index) => (
                  <div key={creneau.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600">Date de début</Label>
                        <Input
                          type="date"
                          value={creneau.dateDebut.toISOString().split('T')[0]}
                          onChange={(e) => updateCreneau(creneau.id, 'dateDebut', new Date(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Date de fin</Label>
                        <Input
                          type="date"
                          value={creneau.dateFin.toISOString().split('T')[0]}
                          onChange={(e) => updateCreneau(creneau.id, 'dateFin', new Date(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-500">
                        {creneau.duree} jour{creneau.duree > 1 ? 's' : ''}
                      </div>
                      {creneaux.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCreneau(creneau.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {creneaux.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Aucun créneau défini. Cliquez sur "Ajouter un créneau" pour commencer.
                  </div>
                )}
              </div>
            </div>

            {/* Statut */}
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => handleChange('statut', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StatutPhase.EN_ATTENTE}>En attente</SelectItem>
                  <SelectItem value={StatutPhase.EN_COURS}>En cours</SelectItem>
                  <SelectItem value={StatutPhase.TERMINE}>Terminé</SelectItem>
                  <SelectItem value={StatutPhase.RETARDE}>Retardé</SelectItem>
                  <SelectItem value={StatutPhase.ANNULE}>Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordre */}
            <div>
              <Label htmlFor="ordre">Ordre</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="ordre"
                  type="number"
                  value={formData.ordre}
                  onChange={(e) => handleChange('ordre', parseInt(e.target.value) || 0)}
                  className="pl-10"
                  min="0"
                />
              </div>
            </div>

            {/* Couleur */}
            <div>
              <Label htmlFor="couleur">Couleur</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="couleur"
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => handleChange('couleur', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-gray-500">Couleur d'affichage</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description détaillée de la phase..."
              rows={3}
            />
          </div>

          {/* Agents assignés */}
          <div>
            <Label className="flex items-center mb-3">
              <Users className="h-4 w-4 mr-2" />
              Agents assignés
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`agent-${agent.id}`}
                    checked={formData.agents.includes(agent.id)}
                    onCheckedChange={(checked) => handleAgentToggle(agent.id, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`agent-${agent.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {agent.prenom} {agent.nom}
                  </Label>
                </div>
              ))}
            </div>
            {agents.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun agent disponible
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
