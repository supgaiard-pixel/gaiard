'use client';

import { useState, useEffect } from 'react';
import { JalonProjet, TypeJalon, StatutJalonProjet } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jalon: Omit<JalonProjet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  jalon?: JalonProjet | null;
  projectId: string;
}

const typeJalonLabels: Record<TypeJalon, string> = {
  [TypeJalon.DEBUT_CHANTIER]: 'Début de chantier',
  [TypeJalon.FIN_PHASE_CRITIQUE]: 'Fin de phase critique',
  [TypeJalon.LIVRAISON_MATERIEL]: 'Livraison matériel',
  [TypeJalon.CONTROLE_TECHNIQUE]: 'Contrôle technique',
  [TypeJalon.MISE_EN_SERVICE]: 'Mise en service',
  [TypeJalon.RECEPTION_CLIENT]: 'Réception client',
  [TypeJalon.AUTRE]: 'Autre',
};

const statutJalonLabels: Record<StatutJalonProjet, string> = {
  [StatutJalonProjet.EN_ATTENTE]: 'En attente',
  [StatutJalonProjet.EN_COURS]: 'En cours',
  [StatutJalonProjet.TERMINE]: 'Terminé',
  [StatutJalonProjet.RETARDE]: 'Retardé',
  [StatutJalonProjet.ANNULE]: 'Annulé',
};

export function JalonModal({ isOpen, onClose, onSave, jalon, projectId }: JalonModalProps) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateEcheance: new Date(),
    type: TypeJalon.AUTRE,
    statut: StatutJalonProjet.EN_ATTENTE,
    ordre: 0,
    couleur: '#ef4444', // Rouge par défaut
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (jalon) {
      setFormData({
        titre: jalon.titre,
        description: jalon.description,
        dateEcheance: jalon.dateEcheance,
        type: jalon.type,
        statut: jalon.statut,
        ordre: jalon.ordre,
        couleur: jalon.couleur,
      });
    } else {
      setFormData({
        titre: '',
        description: '',
        dateEcheance: new Date(),
        type: TypeJalon.AUTRE,
        statut: StatutJalonProjet.EN_ATTENTE,
        ordre: 0,
        couleur: '#ef4444',
      });
    }
  }, [jalon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const jalonData = {
      projectId,
      ...formData,
    };

    await onSave(jalonData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {jalon ? 'Modifier le jalon' : 'Nouveau jalon'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                placeholder="Ex: Livraison des panneaux"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type de jalon</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value as TypeJalon)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeJalonLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du jalon..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date d'échéance *</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.dateEcheance, 'dd/MM/yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateEcheance}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('dateEcheance', date);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => handleInputChange('statut', value as StatutJalonProjet)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statutJalonLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ordre">Ordre d'affichage</Label>
              <Input
                id="ordre"
                type="number"
                value={formData.ordre}
                onChange={(e) => handleInputChange('ordre', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="couleur">Couleur</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="couleur"
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => handleInputChange('couleur', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-gray-500">Rouge par défaut</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {jalon ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
