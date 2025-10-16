'use client';

import { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Projet, StatutProjet } from '@/types';

interface ProjetModalProps {
  isOpen: boolean;
  onClose: () => void;
  projet?: Projet | null;
  onSave: (projet: Omit<Projet, 'id' | 'createdAt' | 'updatedAt' | 'phases'>) => Promise<void>;
}

export function ProjetModal({ isOpen, onClose, projet, onSave }: ProjetModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    client: '',
    adresse: '',
    statut: StatutProjet.EN_PREPARATION,
    couleur: '#3B82F6',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projet) {
      setFormData({
        nom: projet.nom,
        description: projet.description,
        client: projet.client,
        adresse: projet.adresse,
        statut: projet.statut,
        couleur: projet.couleur,
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        client: '',
        adresse: '',
        statut: StatutProjet.EN_PREPARATION,
        couleur: '#3B82F6',
      });
    }
  }, [projet, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const projetData = {
        ...formData,
        // Les dates seront calculées automatiquement à partir des phases
        dateDebut: new Date(), // Date par défaut, sera recalculée
        dateFin: new Date(), // Date par défaut, sera recalculée
      };

      await onSave(projetData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {projet ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom du projet */}
            <div className="md:col-span-2">
              <Label htmlFor="nom">Nom du projet *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Ex: Installation photovoltaïque - Villa Martin"
                required
              />
            </div>

            {/* Client */}
            <div>
              <Label htmlFor="client">Client *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => handleChange('client', e.target.value)}
                  placeholder="Nom du client"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <Label htmlFor="adresse">Adresse *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  placeholder="Adresse du projet"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Note sur les dates */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Dates automatiques</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Les dates de début et fin du projet seront calculées automatiquement à partir des phases que vous ajouterez.
                    </p>
                  </div>
                </div>
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
                  <SelectItem value={StatutProjet.EN_PREPARATION}>En préparation</SelectItem>
                  <SelectItem value={StatutProjet.EN_COURS}>En cours</SelectItem>
                  <SelectItem value={StatutProjet.EN_PAUSE}>En pause</SelectItem>
                  <SelectItem value={StatutProjet.TERMINE}>Terminé</SelectItem>
                  <SelectItem value={StatutProjet.ANNULE}>Annulé</SelectItem>
                </SelectContent>
              </Select>
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
              placeholder="Description détaillée du projet..."
              rows={4}
            />
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
