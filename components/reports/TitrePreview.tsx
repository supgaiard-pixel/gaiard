'use client';

import { FileText } from 'lucide-react';
import { TypeRapport } from '@/types';
import { format } from 'date-fns';
import { generateRapportTitleFromParams, cleanChantierName } from '@/utils/rapportUtils';

interface TitrePreviewProps {
  nomChantier: string;
  type: TypeRapport;
  dateRapport: Date;
}

const typeLabels: Record<TypeRapport, string> = {
  [TypeRapport.INTERVENTION]: 'Intervention',
  [TypeRapport.INCIDENCE]: 'Incidence',
  [TypeRapport.VISITE_CHANTIER]: 'Visite_Chantier',
  [TypeRapport.REUNION]: 'Reunion',
  [TypeRapport.SECURITE]: 'Securite',
  [TypeRapport.QUALITE]: 'Qualite',
  [TypeRapport.MAINTENANCE]: 'Maintenance',
  [TypeRapport.RAPPORT_STAGE]: 'Rapport_Stage',
  [TypeRapport.AUTRE]: 'Autre',
};

export function TitrePreview({ nomChantier, type, dateRapport }: TitrePreviewProps) {
  const nomChantierNettoye = cleanChantierName(nomChantier);
  const titreAutomatique = generateRapportTitleFromParams(nomChantierNettoye, type, dateRapport);
  
  return (
    <div className="mt-2 p-3 bg-gray-50 border rounded-md">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" />
        <span className="font-mono text-sm text-gray-700">
          {titreAutomatique}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <strong>Chantier:</strong> {nomChantierNettoye}
          </div>
          <div>
            <strong>Type:</strong> {typeLabels[type]}
          </div>
          <div>
            <strong>Date:</strong> {format(dateRapport, 'yyyyMMdd')}
          </div>
        </div>
        <p className="mt-1 text-gray-400">
          Format: Nom du chantier / Type de rapport / Date (AAAAMMJJ)
        </p>
      </div>
    </div>
  );
}
