'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, FileText, ExternalLink, QrCode, Download, Camera, Image, X } from 'lucide-react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Rapport, TypeRapport, PeriodeRapport, StatutRapport } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TitrePreview } from './TitrePreview';

const rapportSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  contenu: z.string().min(1, 'Le contenu est requis'),
  type: z.nativeEnum(TypeRapport),
  projetId: z.string().min(1, 'Le projet est requis'),
  agentsIds: z.array(z.string()).min(1, 'Au moins un agent est requis'),
  dateRapport: z.date(),
  periode: z.nativeEnum(PeriodeRapport),
  statut: z.nativeEnum(StatutRapport),
  isExterne: z.boolean().optional(),
  photos: z.array(z.string()).optional(), // URLs des photos
});

type RapportFormData = z.infer<typeof rapportSchema>;

interface RapportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rapport?: Rapport | null;
  projetId?: string;
}

const typeLabels: Record<TypeRapport, string> = {
  [TypeRapport.INTERVENTION]: 'Intervention',
  [TypeRapport.INCIDENCE]: 'Incidence',
  [TypeRapport.VISITE_CHANTIER]: 'Visite de chantier',
  [TypeRapport.REUNION]: 'Réunion',
  [TypeRapport.SECURITE]: 'Sécurité',
  [TypeRapport.QUALITE]: 'Qualité',
  [TypeRapport.MAINTENANCE]: 'Maintenance',
  [TypeRapport.RAPPORT_STAGE]: 'Rapport de stage',
  [TypeRapport.AUTRE]: 'Autre',
};

const periodeLabels: Record<PeriodeRapport, string> = {
  [PeriodeRapport.JOURNALIER]: 'Journalier',
  [PeriodeRapport.HEBDOMADAIRE]: 'Hebdomadaire',
  [PeriodeRapport.MENSUEL]: 'Mensuel',
  [PeriodeRapport.PONCTUEL]: 'Ponctuel',
};

const statutLabels: Record<StatutRapport, string> = {
  [StatutRapport.BROUILLON]: 'Brouillon',
  [StatutRapport.EN_ATTENTE_VALIDATION]: 'En attente de validation',
  [StatutRapport.VALIDE]: 'Validé',
  [StatutRapport.REFUSE]: 'Refusé',
  [StatutRapport.ARCHIVE]: 'Archivé',
};

export function RapportModal({ isOpen, onClose, rapport, projetId }: RapportModalProps) {
  const { projets, agents, saveRapport, updateRapportFirebase, generateRapportPDF, generateQRCode } = usePlanningStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RapportFormData>({
    resolver: zodResolver(rapportSchema),
    defaultValues: {
      description: '',
      contenu: '',
      type: TypeRapport.INTERVENTION,
      projetId: projetId || '',
      agentsIds: [],
      dateRapport: new Date(),
      periode: PeriodeRapport.PONCTUEL,
      statut: StatutRapport.BROUILLON,
      isExterne: false,
    },
  });

  const isExterne = watch('isExterne');
  const selectedProjetId = watch('projetId');

  useEffect(() => {
    if (rapport) {
      reset({
        description: rapport.description,
        contenu: rapport.contenu,
        type: rapport.type,
        projetId: rapport.projetId,
        agentsIds: rapport.agentsIds,
        dateRapport: rapport.dateRapport,
        periode: rapport.periode,
        statut: rapport.statut,
        isExterne: rapport.isExterne,
      });
      setSelectedAgents(rapport.agentsIds);
    } else {
      reset({
        description: '',
        contenu: '',
        type: TypeRapport.INTERVENTION,
        projetId: projetId || '',
        agentsIds: [],
        dateRapport: new Date(),
        periode: PeriodeRapport.PONCTUEL,
        statut: StatutRapport.BROUILLON,
        isExterne: false,
      });
      setSelectedAgents([]);
    }
  }, [rapport, projetId, reset]);

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (rapport) {
        reset({
          description: rapport.description,
          contenu: rapport.contenu,
          type: rapport.type,
          projetId: rapport.projetId,
          agentsIds: rapport.agentsIds,
          dateRapport: rapport.dateRapport,
          periode: rapport.periode,
          statut: rapport.statut,
          isExterne: rapport.isExterne,
        });
        setSelectedAgents(rapport.agentsIds);
      } else {
        reset({
          description: '',
          contenu: '',
          type: TypeRapport.INTERVENTION,
          projetId: projetId || '',
          agentsIds: [],
          dateRapport: new Date(),
          periode: PeriodeRapport.PONCTUEL,
          statut: StatutRapport.BROUILLON,
          isExterne: false,
        });
        setSelectedAgents([]);
      }
    }
  }, [isOpen, rapport, projetId, reset]);

  const handleAgentToggle = (agentId: string) => {
    const newSelectedAgents = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    
    setSelectedAgents(newSelectedAgents);
    setValue('agentsIds', newSelectedAgents);
  };

  const onSubmit = async (data: RapportFormData) => {
    setIsLoading(true);
    try {
      // Générer le titre automatique
      const projet = projets.find(p => p.id === data.projetId);
      const nomChantier = projet?.nom || 'Chantier_Inconnu';
      const typeRapport = typeLabels[data.type] || 'Rapport';
      const dateFormatee = format(data.dateRapport, 'yyyyMMdd');
      const titreAutomatique = `${nomChantier}/${typeRapport}/${dateFormatee}`;

      let rapportId: string;
      if (rapport) {
        await updateRapportFirebase(rapport.id, { 
          ...data, 
          titre: titreAutomatique
        });
        rapportId = rapport.id;
      } else {
        const rapportData = {
          ...data,
          titre: titreAutomatique,
          agentsIds: selectedAgents,
          isExterne: data.isExterne || false,
        };
        rapportId = await saveRapport(rapportData);
      }

      // Uploader les photos séparément si il y en a
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        try {
          const formData = new FormData();
          formData.append('rapportId', rapportId);
          photoFiles.forEach(file => {
            formData.append('photos', file);
          });

          const response = await fetch('/api/rapports/upload-photos', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            photoUrls = result.photoUrls;
            
            // Mettre à jour le rapport avec les URLs des photos
            await updateRapportFirebase(rapportId, { photos: photoUrls });
          } else {
            console.warn('Erreur lors de l\'upload des photos');
          }
        } catch (photoError) {
          console.warn('Erreur lors de l\'upload des photos:', photoError);
        }
      }

      // Générer automatiquement le PDF après création/modification
      try {
        await generateRapportPDF(rapportId);
      } catch (pdfError) {
        console.warn('Erreur lors de la génération du PDF:', pdfError);
        // Ne pas faire échouer la sauvegarde du rapport
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rapport:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!rapport) return;
    
    try {
      setIsLoading(true);
      const pdfUrl = await generateRapportPDF(rapport.id);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!rapport) return;
    
    try {
      setIsLoading(true);
      const qrCodeUrl = await generateQRCode(rapport.id);
      window.open(qrCodeUrl, '_blank');
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        // Créer une URL temporaire pour l'aperçu (pas de base64)
        const tempUrl = URL.createObjectURL(file);
        setPhotos(prev => [...prev, tempUrl]);
        setPhotoFiles(prev => [...prev, file]);
      }
    });
  };

  const removePhoto = (index: number) => {
    // Nettoyer l'URL temporaire si c'est un blob
    const photoToRemove = photos[index];
    if (photoToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove);
    }
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Nettoyer les URLs temporaires au démontage du composant
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.startsWith('blob:')) {
          URL.revokeObjectURL(photo);
        }
      });
    };
  }, [photos]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {rapport ? 'Modifier le rapport' : 'Nouveau rapport'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Titre automatique - Aperçu */}
            <div className="md:col-span-2">
              <Label>Titre du rapport (généré automatiquement)</Label>
              <TitrePreview
                nomChantier={projets.find(p => p.id === watch('projetId'))?.nom || 'Chantier_Inconnu'}
                type={watch('type')}
                dateRapport={watch('dateRapport')}
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={watch('type')} 
                onValueChange={(value) => setValue('type', value as TypeRapport)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Période */}
            <div>
              <Label htmlFor="periode">Période *</Label>
              <Select 
                value={watch('periode')} 
                onValueChange={(value) => setValue('periode', value as PeriodeRapport)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.periode && (
                <p className="text-sm text-red-600 mt-1">{errors.periode.message}</p>
              )}
            </div>

            {/* Projet */}
            <div>
              <Label htmlFor="projet">Projet *</Label>
              <Select 
                value={watch('projetId')} 
                onValueChange={(value) => setValue('projetId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projets.map((projet) => (
                    <SelectItem key={projet.id} value={projet.id}>
                      {projet.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projetId && (
                <p className="text-sm text-red-600 mt-1">{errors.projetId.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="dateRapport">Date du rapport *</Label>
              <Input
                id="dateRapport"
                type="date"
                {...register('dateRapport', { valueAsDate: true })}
              />
              {errors.dateRapport && (
                <p className="text-sm text-red-600 mt-1">{errors.dateRapport.message}</p>
              )}
            </div>

            {/* Statut */}
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={watch('statut')} 
                onValueChange={(value) => setValue('statut', value as StatutRapport)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statutLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rapport externe */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isExterne"
                checked={isExterne}
                onCheckedChange={(checked) => setValue('isExterne', checked as boolean)}
              />
              <Label htmlFor="isExterne" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Rapport externe (accessible sans authentification)
              </Label>
            </div>

            {/* Photos */}
            <div className="md:col-span-2">
              <Label>Photos du chantier</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Camera className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Cliquer pour ajouter des photos
                  </span>
                </label>
                
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agents */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              Agents associés *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`agent-${agent.id}`}
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={() => handleAgentToggle(agent.id)}
                  />
                  <Label htmlFor={`agent-${agent.id}`} className="text-sm">
                    {agent.prenom} {agent.nom}
                  </Label>
                </div>
              ))}
            </div>
            {errors.agentsIds && (
              <p className="text-sm text-red-600 mt-1">{errors.agentsIds.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description du rapport"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Contenu */}
          <div>
            <Label htmlFor="contenu">Contenu détaillé *</Label>
            <Textarea
              id="contenu"
              {...register('contenu')}
              placeholder="Contenu détaillé du rapport"
              rows={6}
            />
            {errors.contenu && (
              <p className="text-sm text-red-600 mt-1">{errors.contenu.message}</p>
            )}
          </div>

          {/* Actions pour les rapports existants */}
          {rapport && (
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePDF}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Générer PDF
              </Button>
              {rapport.isExterne && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateQRCode}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Générer QR Code
                </Button>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sauvegarde...' : rapport ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
