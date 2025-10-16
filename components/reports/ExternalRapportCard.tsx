'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Building, 
  User, 
  Users, 
  Download,
  ExternalLink,
  Clock,
  MapPin
} from 'lucide-react';
import { Rapport, Projet, Agent } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExternalRapportCardProps {
  rapport: Rapport;
  projet?: Projet;
  agents?: Agent[];
}

export function ExternalRapportCard({ rapport, projet, agents = [] }: ExternalRapportCardProps) {
  const associatedAgents = agents.filter(a => rapport.agentsIds.includes(a.id));
  const redacteur = agents.find(a => a.id === rapport.redacteurId);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'intervention': 'bg-blue-100 text-blue-800',
      'incidence': 'bg-red-100 text-red-800',
      'visite_chantier': 'bg-green-100 text-green-800',
      'reunion': 'bg-purple-100 text-purple-800',
      'securite': 'bg-orange-100 text-orange-800',
      'qualite': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-gray-100 text-gray-800',
      'rapport_stage': 'bg-indigo-100 text-indigo-800',
      'autre': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors['autre'];
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'en_attente_validation': 'bg-yellow-100 text-yellow-800',
      'valide': 'bg-green-100 text-green-800',
      'refuse': 'bg-red-100 text-red-800',
      'archive': 'bg-gray-100 text-gray-800',
    };
    return colors[statut] || colors['brouillon'];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">
                {rapport.titre}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTypeColor(rapport.type)}>
                  {rapport.type.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getStatutColor(rapport.statut)}>
                  {rapport.statut.replace('_', ' ').toUpperCase()}
                </Badge>
                {rapport.isExterne && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    EXTERNE
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Calendar className="h-4 w-4" />
                Date du rapport
              </div>
              <p className="font-medium">
                {format(rapport.dateRapport, 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Building className="h-4 w-4" />
                Projet
              </div>
              <p className="font-medium">
                {projet?.nom || 'Projet non trouvé'}
              </p>
              {projet?.client && (
                <p className="text-sm text-gray-600">
                  Client: {projet.client}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <User className="h-4 w-4" />
                Rédacteur
              </div>
              <p className="font-medium">
                {redacteur ? `${redacteur.prenom} ${redacteur.nom}` : 'Non spécifié'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Users className="h-4 w-4" />
                Agents associés
              </div>
              <p className="font-medium">
                {associatedAgents.length > 0 
                  ? associatedAgents.map(a => `${a.prenom} ${a.nom}`).join(', ')
                  : 'Aucun'
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock className="h-4 w-4" />
                Période
              </div>
              <p className="font-medium capitalize">
                {rapport.periode.replace('_', ' ')}
              </p>
            </div>

            {projet?.adresse && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </div>
                <p className="font-medium text-sm">
                  {projet.adresse}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contenu du rapport */}
        <div className="space-y-6">
          {rapport.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {rapport.description}
                </p>
              </div>
            </div>
          )}

          {rapport.contenu && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contenu détaillé</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {rapport.contenu}
                </p>
              </div>
            </div>
          )}

          {/* Photos */}
          {rapport.photos && rapport.photos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Photos du chantier ({rapport.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rapport.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(photo, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {rapport.pdfUrl && (
              <Button asChild>
                <a href={rapport.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le PDF
                </a>
              </Button>
            )}
            
            <Button variant="outline" onClick={() => window.print()}>
              <FileText className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


