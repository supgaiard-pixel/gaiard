'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Intervention, CategorieIntervention, StatutIntervention } from '@/types';
import { Calendar, Clock, User, MapPin, FileText } from 'lucide-react';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervention?: Intervention | null;
}

export function InterventionModal({ isOpen, onClose, intervention }: InterventionModalProps) {
  const { agents, saveIntervention, updateInterventionFirebase } = usePlanningStore();
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    agentId: '',
    dateDebut: '',
    dateFin: '',
    duree: '',
    categorie: CategorieIntervention.INSTALLATION,
    statut: StatutIntervention.PLANIFIEE,
    adresse: '',
    client: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (intervention) {
      setFormData({
        titre: intervention.titre || '',
        description: intervention.description || '',
        agentId: intervention.agentId || '',
        dateDebut: intervention.dateDebut ? intervention.dateDebut.toISOString().slice(0, 16) : '',
        dateFin: intervention.dateFin ? intervention.dateFin.toISOString().slice(0, 16) : '',
        duree: intervention.duree?.toString() || '',
        categorie: intervention.categorie || CategorieIntervention.INSTALLATION,
        statut: intervention.statut || StatutIntervention.PLANIFIEE,
        adresse: intervention.adresse || '',
        client: intervention.client || '',
        notes: intervention.notes || '',
      });
    } else {
      setFormData({
        titre: '',
        description: '',
        agentId: '',
        dateDebut: '',
        dateFin: '',
        duree: '',
        categorie: CategorieIntervention.INSTALLATION,
        statut: StatutIntervention.PLANIFIEE,
        adresse: '',
        client: '',
        notes: '',
      });
    }
    setErrors({});
  }, [intervention, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }

    if (!formData.agentId) {
      newErrors.agentId = 'Un agent doit être sélectionné';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    if (!formData.dateFin) {
      newErrors.dateFin = 'La date de fin est requise';
    }

    if (formData.dateDebut && formData.dateFin && new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }

    if (!formData.duree || isNaN(Number(formData.duree)) || Number(formData.duree) <= 0) {
      newErrors.duree = 'La durée doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const interventionData: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'> = {
      titre: formData.titre,
      description: formData.description,
      agentId: formData.agentId,
      dateDebut: new Date(formData.dateDebut),
      dateFin: new Date(formData.dateFin),
      duree: Number(formData.duree),
      categorie: formData.categorie,
      statut: formData.statut,
      adresse: formData.adresse,
      client: formData.client,
      notes: formData.notes,
    };

    try {
      if (intervention) {
        await updateInterventionFirebase(intervention.id, interventionData);
      } else {
        await saveIntervention(interventionData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const categories = [
    { value: CategorieIntervention.INSTALLATION, label: 'Installation' },
    { value: CategorieIntervention.MAINTENANCE, label: 'Maintenance' },
    { value: CategorieIntervention.REPARATION, label: 'Réparation' },
    { value: CategorieIntervention.CONTROLE, label: 'Contrôle' },
    { value: CategorieIntervention.FORMATION, label: 'Formation' },
    { value: CategorieIntervention.AUTRE, label: 'Autre' },
  ];

  const statuts = [
    { value: StatutIntervention.PLANIFIEE, label: 'Planifiée' },
    { value: StatutIntervention.EN_COURS, label: 'En cours' },
    { value: StatutIntervention.TERMINEE, label: 'Terminée' },
    { value: StatutIntervention.ANNULEE, label: 'Annulée' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {intervention ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className={errors.titre ? 'border-red-500' : ''}
                placeholder="Titre de l'intervention"
              />
              {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'intervention"
                rows={3}
              />
            </div>
          </div>

          {/* Planning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.prenom} {agent.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agentId && <p className="text-red-500 text-sm mt-1">{errors.agentId}</p>}
            </div>

            <div>
              <Label htmlFor="categorie">Catégorie</Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) => setFormData({ ...formData, categorie: value as CategorieIntervention })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((categorie) => (
                    <SelectItem key={categorie.value} value={categorie.value}>
                      {categorie.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="datetime-local"
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
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className={errors.dateFin ? 'border-red-500' : ''}
              />
              {errors.dateFin && <p className="text-red-500 text-sm mt-1">{errors.dateFin}</p>}
            </div>

            <div>
              <Label htmlFor="duree">Durée (heures) *</Label>
              <Input
                id="duree"
                type="number"
                value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                className={errors.duree ? 'border-red-500' : ''}
                placeholder="8"
              />
              {errors.duree && <p className="text-red-500 text-sm mt-1">{errors.duree}</p>}
            </div>

            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => setFormData({ ...formData, statut: value as StatutIntervention })}
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

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse du chantier"
              />
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires"
              rows={3}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {intervention ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
