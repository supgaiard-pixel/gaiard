'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Agent } from '@/types';
import { X, Plus } from 'lucide-react';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: Agent | null;
}

export function AgentModal({ isOpen, onClose, agent }: AgentModalProps) {
  const { saveAgent, updateAgentFirebase } = usePlanningStore();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    habilitations: [] as string[],
    couleur: '#3B82F6',
    actif: true,
  });

  const [newHabilitation, setNewHabilitation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (agent) {
      setFormData({
        nom: agent.nom || '',
        prenom: agent.prenom || '',
        email: agent.email || '',
        telephone: agent.telephone || '',
        habilitations: agent.habilitations || [],
        couleur: agent.couleur || '#3B82F6',
        actif: agent.actif ?? true,
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        habilitations: [],
        couleur: '#3B82F6',
        actif: true,
      });
    }
    setNewHabilitation('');
    setErrors({});
  }, [agent, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      habilitations: formData.habilitations,
      couleur: formData.couleur,
      actif: formData.actif,
    };

    try {
      if (agent) {
        await updateAgentFirebase(agent.id, agentData);
      } else {
        await saveAgent(agentData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const addHabilitation = () => {
    if (newHabilitation.trim() && !formData.habilitations.includes(newHabilitation.trim())) {
      setFormData({
        ...formData,
        habilitations: [...formData.habilitations, newHabilitation.trim()]
      });
      setNewHabilitation('');
    }
  };

  const removeHabilitation = (index: number) => {
    setFormData({
      ...formData,
      habilitations: formData.habilitations.filter((_, i) => i !== index)
    });
  };

  const couleurs = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agent ? 'Modifier l\'agent' : 'Nouvel agent'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className={errors.prenom ? 'border-red-500' : ''}
                placeholder="Prénom"
              />
              {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={errors.nom ? 'border-red-500' : ''}
                placeholder="Nom"
              />
              {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className={errors.telephone ? 'border-red-500' : ''}
                placeholder="06 12 34 56 78"
              />
              {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <Label>Couleur d'affichage</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {couleurs.map((couleur) => (
                <button
                  key={couleur}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.couleur === couleur ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: couleur }}
                  onClick={() => setFormData({ ...formData, couleur })}
                />
              ))}
            </div>
          </div>

          {/* Habilitations */}
          <div>
            <Label>Habilitations</Label>
            <div className="mt-2 space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newHabilitation}
                  onChange={(e) => setNewHabilitation(e.target.value)}
                  placeholder="Ajouter une habilitation"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHabilitation())}
                />
                <Button
                  type="button"
                  onClick={addHabilitation}
                  disabled={!newHabilitation.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.habilitations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.habilitations.map((habilitation, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                    >
                      <span>{habilitation}</span>
                      <button
                        type="button"
                        onClick={() => removeHabilitation(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="actif">Agent actif</Label>
              <p className="text-sm text-gray-600">
                Les agents inactifs n'apparaîtront pas dans les sélections
              </p>
            </div>
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {agent ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
