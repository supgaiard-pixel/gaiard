'use client';

import { useEffect } from 'react';
import { RapportList } from '@/components/reports/RapportList';
import { LocalStorageTreeView } from '@/components/reports/LocalStorageTreeView';
import { usePlanningStore } from '@/store/usePlanningStore';
import { useFirebase } from '@/components/FirebaseProvider';
import { FileText, Download, Folder, HardDrive } from 'lucide-react';

export default function ReportsPage() {
  const { 
    agents, 
    projets, 
    rapports,
    loadAgents, 
    loadProjets, 
    loadRapports
  } = usePlanningStore();
  const { isInitialized } = useFirebase();

  // Charger toutes les données
  useEffect(() => {
    if (isInitialized) {
      loadAgents();
      loadProjets();
      loadRapports();
    }
  }, [isInitialized, loadAgents, loadProjets, loadRapports]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
                <p className="text-gray-600">Gérez vos rapports d'intervention et de chantier</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Download className="h-4 w-4" />
                <span>Export PDF disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Liste des rapports */}
          <div className="lg:col-span-2">
            <RapportList showFilters={true} />
          </div>
          
          {/* Arborescence du stockage local */}
          <div className="lg:col-span-2">
            <LocalStorageTreeView 
              rapports={rapports.filter(r => r.pdfUrl)} 
              projets={projets} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}


