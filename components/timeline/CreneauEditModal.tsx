'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, AlertCircle, Save, X } from 'lucide-react';
import { Phase, Projet, Creneau } from '@/types';

interface CreneauEditModalProps {
  creneau: Creneau | null;
  phase: Phase | null;
  projet: Projet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (creneau: Creneau, phase: Phase) => void;
}

export default function CreneauEditModal({
  creneau,
  phase,
  projet,
  isOpen,
  onClose,
  onSave
}: CreneauEditModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    duree: 0,
    couleur: '#3B82F6',
    statut: 'planifie' as 'planifie' | 'en_cours' | 'termine' | 'en_retard'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (creneau && phase) {
      setFormData({
        nom: phase.nom,
        description: phase.description || '',
        dateDebut: creneau.dateDebut.toISOString().split('T')[0],
        dateFin: creneau.dateFin.toISOString().split('T')[0],
        duree: creneau.duree,
        couleur: creneau.couleur || phase.couleur || '#3B82F6',
        statut: 'planifie' // Les créneaux n'ont pas de statut dans le type actuel
      });
    }
  }, [creneau, phase]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    if (!formData.dateFin) {
      newErrors.dateFin = 'La date de fin est requise';
    }

    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      
      if (debut >= fin) {
        newErrors.dateFin = 'La date de fin doit être après la date de début';
      }
    }

    if (formData.duree <= 0) {
      newErrors.duree = 'La durée doit être positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !creneau || !phase) return;

    const updatedCreneau: Creneau = {
      ...creneau,
      dateDebut: new Date(formData.dateDebut),
      dateFin: new Date(formData.dateFin),
      duree: formData.duree,
      couleur: formData.couleur
    };

    const updatedPhase: Phase = {
      ...phase,
      nom: formData.nom,
      description: formData.description,
      dateDebut: new Date(formData.dateDebut),
      dateFin: new Date(formData.dateFin),
      duree: formData.duree,
      couleur: formData.couleur
    };

    onSave(updatedCreneau, updatedPhase);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateDuration = () => {
    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      const diffTime = Math.abs(fin.getTime() - debut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData(prev => ({ ...prev, duree: diffDays }));
    }
  };

  if (!creneau || !phase || !projet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Modifier le créneau
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du projet et phase */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Projet :</span>
                <p className="text-gray-900">{projet.nom}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phase :</span>
                <p className="text-gray-900">{phase.nom}</p>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du créneau *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className={errors.nom ? 'border-red-500' : ''}
                placeholder="Nom du créneau"
              />
              {errors.nom && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.nom}
                </p>
              )}
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => handleInputChange('statut', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifie">Planifié</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date de début */}
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                className={errors.dateDebut ? 'border-red-500' : ''}
              />
              {errors.dateDebut && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dateDebut}
                </p>
              )}
            </div>

            {/* Date de fin */}
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => handleInputChange('dateFin', e.target.value)}
                className={errors.dateFin ? 'border-red-500' : ''}
              />
              {errors.dateFin && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dateFin}
                </p>
              )}
            </div>

            {/* Durée */}
            <div className="space-y-2">
              <Label htmlFor="duree">Durée (jours)</Label>
              <div className="flex gap-2">
                <Input
                  id="duree"
                  type="number"
                  min="1"
                  value={formData.duree}
                  onChange={(e) => handleInputChange('duree', parseInt(e.target.value) || 0)}
                  className={errors.duree ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={calculateDuration}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  Calculer
                </Button>
              </div>
              {errors.duree && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.duree}
                </p>
              )}
            </div>

            {/* Couleur */}
            <div className="space-y-2">
              <Label htmlFor="couleur">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  id="couleur"
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => handleInputChange('couleur', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.couleur}
                  onChange={(e) => handleInputChange('couleur', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du créneau..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
