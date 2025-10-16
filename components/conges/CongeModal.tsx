'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Conge, TypeConge, StatutConge } from '@/types';
import { Calendar } from 'lucide-react';

interface CongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conge?: Conge | null;
}

export function CongeModal({ isOpen, onClose, conge }: CongeModalProps) {
  const { agents, saveConge, updateCongeFirebase } = usePlanningStore();
  
  const [formData, setFormData] = useState({
    agentId: '',
    dateDebut: '',
    dateFin: '',
    type: TypeConge.ANNUEL,
    statut: StatutConge.EN_ATTENTE,
    motif: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (conge) {
      setFormData({
        agentId: conge.agentId || '',
        dateDebut: conge.dateDebut ? conge.dateDebut.toISOString().slice(0, 10) : '',
        dateFin: conge.dateFin ? conge.dateFin.toISOString().slice(0, 10) : '',
        type: conge.type || TypeConge.ANNUEL,
        statut: conge.statut || StatutConge.EN_ATTENTE,
        motif: conge.motif || '',
      });
    } else {
      setFormData({
        agentId: '',
        dateDebut: '',
        dateFin: '',
        type: TypeConge.ANNUEL,
        statut: StatutConge.EN_ATTENTE,
        motif: '',
      });
    }
    setErrors({});
  }, [conge, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.agentId) {
      newErrors.agentId = 'Un agent doit être sélectionné';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    if (!formData.dateFin) {
      newErrors.dateFin = 'La date de fin est requise';
    }

    if (formData.dateDebut && formData.dateFin && new Date(formData.dateDebut) > new Date(formData.dateFin)) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }

    if (!formData.motif.trim()) {
      newErrors.motif = 'Le motif est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const congeData: Omit<Conge, 'id' | 'createdAt' | 'updatedAt'> = {
      agentId: formData.agentId,
      dateDebut: new Date(formData.dateDebut),
      dateFin: new Date(formData.dateFin),
      type: formData.type,
      statut: formData.statut,
      motif: formData.motif,
    };

    try {
      if (conge) {
        await updateCongeFirebase(conge.id, congeData);
      } else {
        await saveConge(congeData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const types = [
    { value: TypeConge.ANNUEL, label: 'Congé annuel' },
    { value: TypeConge.MALADIE, label: 'Arrêt maladie' },
    { value: TypeConge.MATERNITE, label: 'Congé maternité' },
    { value: TypeConge.PATERNITE, label: 'Congé paternité' },
    { value: TypeConge.RTT, label: 'RTT' },
    { value: TypeConge.AUTRE, label: 'Autre' },
  ];

  const statuts = [
    { value: StatutConge.EN_ATTENTE, label: 'En attente' },
    { value: StatutConge.VALIDE, label: 'Validé' },
    { value: StatutConge.REFUSE, label: 'Refusé' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {conge ? 'Modifier le congé' : 'Nouveau congé'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent */}
          <div>
            <Label htmlFor="agentId">Agent *</Label>
            <Select
              value={formData.agentId}
              onValueChange={(value) => setFormData({ ...formData, agentId: value })}
            >
              <SelectTrigger className={errors.agentId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner un agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.filter(agent => agent.actif).map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.prenom} {agent.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.agentId && <p className="text-red-500 text-sm mt-1">{errors.agentId}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className={errors.dateDebut ? 'border-red-500' : ''}
              />
              {errors.dateDebut && <p className="text-red-500 text-sm mt-1">{errors.dateDebut}</p>}
            </div>

            <div>
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className={errors.dateFin ? 'border-red-500' : ''}
              />
              {errors.dateFin && <p className="text-red-500 text-sm mt-1">{errors.dateFin}</p>}
            </div>
          </div>

          {/* Type et statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de congé</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TypeConge })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => setFormData({ ...formData, statut: value as StatutConge })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuts.map((statut) => (
                    <SelectItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Motif */}
          <div>
            <Label htmlFor="motif">Motif *</Label>
            <Textarea
              id="motif"
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              className={errors.motif ? 'border-red-500' : ''}
              placeholder="Motif du congé"
              rows={3}
            />
            {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {conge ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
