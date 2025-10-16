'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TitrePreview } from './TitrePreview';
import { TypeRapport } from '@/types';
import { FileText, Calendar, Building } from 'lucide-react';

// Exemples de données pour tester
const exemplesChantiers = [
  'Installation_PV_Residence_Martin',
  'Maintenance_Parc_Solaire_Industriel',
  'Controle_Qualite_Chantier_Commercial',
  'Visite_Technique_Site_Residentiel',
  'Formation_Equipe_Installation',
  'Stage_Technique_Installation_PV',
  'Stage_Qualite_Controle_Chantier',
  'Stage_Maintenance_Parc_Solaire'
];

const exemplesTypes: TypeRapport[] = [
  TypeRapport.INTERVENTION,
  TypeRapport.INCIDENCE,
  TypeRapport.VISITE_CHANTIER,
  TypeRapport.REUNION,
  TypeRapport.SECURITE,
  TypeRapport.QUALITE,
  TypeRapport.MAINTENANCE,
  TypeRapport.RAPPORT_STAGE
];

export function ExempleRapport() {
  const [chantier, setChantier] = useState(exemplesChantiers[0]);
  const [type, setType] = useState<TypeRapport>(TypeRapport.INTERVENTION);
  const [date, setDate] = useState(new Date());

  const generateExemple = () => {
    const randomChantier = exemplesChantiers[Math.floor(Math.random() * exemplesChantiers.length)];
    const randomType = exemplesTypes[Math.floor(Math.random() * exemplesTypes.length)];
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    setChantier(randomChantier);
    setType(randomType);
    setDate(randomDate);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exemple de génération de titre automatique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Building className="h-4 w-4 inline mr-1" />
              Chantier
            </label>
            <select
              value={chantier}
              onChange={(e) => setChantier(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              {exemplesChantiers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <FileText className="h-4 w-4 inline mr-1" />
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeRapport)}
              className="w-full p-2 border rounded-md text-sm"
            >
              {exemplesTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu du titre généré :</h4>
          <TitrePreview
            nomChantier={chantier}
            type={type}
            dateRapport={date}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={generateExemple} variant="outline" className="flex-1">
            Générer un exemple aléatoire
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
          <strong>Format du titre :</strong> Le titre est généré automatiquement selon le format 
          <code className="bg-blue-100 px-1 rounded">nom_chantier/type_rapport/AAAAMMJJ</code>
          <br />
          <strong>Exemples :</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li>Installation_PV_Residence_Martin/Intervention/20241215</li>
            <li>Maintenance_Parc_Solaire_Industriel/Maintenance/20241210</li>
            <li>Controle_Qualite_Chantier_Commercial/Qualite/20241205</li>
            <li>Stage_Technique_Installation_PV/Rapport_Stage/20241220</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
