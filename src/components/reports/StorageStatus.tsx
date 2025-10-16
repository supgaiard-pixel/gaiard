'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  FileText
} from 'lucide-react';
import { Rapport, Projet } from '@/types';

interface StorageStatusProps {
  rapports: Rapport[];
  projets: Projet[];
}

interface FolderStatus {
  path: string;
  exists: boolean;
  fileCount: number;
}

export function StorageStatus({ rapports, projets }: StorageStatusProps) {
  const [folderStatuses, setFolderStatuses] = useState<FolderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeStorageStructure = () => {
    const statuses: FolderStatus[] = [];
    const folderMap = new Map<string, number>();

    // Analyser les rapports avec PDFs
    rapports.forEach(rapport => {
      if (!rapport.pdfUrl) return;

      const projet = projets.find(p => p.id === rapport.projetId);
      if (!projet) return;

      const nomChantier = projet.nom
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      
      const typeRapport = rapport.type
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();

      const basePath = 'RAPPORT/PDF';
      const chantierPath = `${basePath}/${nomChantier}`;
      const typePath = `${chantierPath}/${typeRapport}`;

      // Compter les fichiers par dossier
      folderMap.set(basePath, (folderMap.get(basePath) || 0) + 1);
      folderMap.set(chantierPath, (folderMap.get(chantierPath) || 0) + 1);
      folderMap.set(typePath, (folderMap.get(typePath) || 0) + 1);
    });

    // Créer les statuts
    folderMap.forEach((fileCount, path) => {
      statuses.push({
        path,
        exists: fileCount > 0,
        fileCount
      });
    });

    setFolderStatuses(statuses);
  };

  useEffect(() => {
    analyzeStorageStructure();
  }, [rapports, projets]);

  const getStatusIcon = (status: FolderStatus) => {
    if (status.exists && status.fileCount > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status.exists) {
      return <Folder className="h-4 w-4 text-blue-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: FolderStatus) => {
    if (status.exists && status.fileCount > 0) {
      return <Badge className="bg-green-100 text-green-800">Actif ({status.fileCount})</Badge>;
    } else if (status.exists) {
      return <Badge variant="outline">Vide</Badge>;
    } else {
      return <Badge variant="destructive">Manquant</Badge>;
    }
  };

  const refreshStatus = () => {
    setIsLoading(true);
    setTimeout(() => {
      analyzeStorageStructure();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statut du stockage
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {folderStatuses.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Aucun PDF généré</p>
          </div>
        ) : (
          <div className="space-y-2">
            {folderStatuses.map((status, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-mono">{status.path}</span>
                </div>
                {getStatusBadge(status)}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Structure automatique :</h4>
          <div className="text-xs text-blue-700">
            <p>Les dossiers sont créés automatiquement lors de la génération des PDFs.</p>
            <p className="mt-1">
              <strong>Format :</strong> RAPPORT/PDF/NOMDUCHANTIER/typederapport/
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


