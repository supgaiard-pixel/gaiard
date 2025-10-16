'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Download,
  Eye,
  Calendar,
  Building
} from 'lucide-react';
import { Rapport, Projet } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PDFTreeViewProps {
  rapports: Rapport[];
  projets: Projet[];
}

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  rapport?: Rapport;
  projet?: Projet;
}

export function PDFTreeView({ rapports, projets }: PDFTreeViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Organiser les rapports par chantier et type
  const organizeRapports = (): TreeNode[] => {
    const tree: TreeNode[] = [];
    const chantiersMap = new Map<string, Map<string, Rapport[]>>();

    // Grouper les rapports par chantier et type
    rapports.forEach(rapport => {
      const projet = projets.find(p => p.id === rapport.projetId);
      if (!projet) return;

      const nomChantier = projet.nom.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').trim();
      const typeRapport = rapport.type.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').trim();

      if (!chantiersMap.has(nomChantier)) {
        chantiersMap.set(nomChantier, new Map());
      }

      const chantierMap = chantiersMap.get(nomChantier)!;
      if (!chantierMap.has(typeRapport)) {
        chantierMap.set(typeRapport, []);
      }

      chantierMap.get(typeRapport)!.push(rapport);
    });

    // Construire l'arbre
    chantiersMap.forEach((typesMap, nomChantier) => {
      const chantierNode: TreeNode = {
        name: nomChantier,
        type: 'folder',
        children: []
      };

      typesMap.forEach((rapportsList, typeRapport) => {
        const typeNode: TreeNode = {
          name: typeRapport,
          type: 'folder',
          children: rapportsList.map(rapport => ({
            name: `${rapport.titre} (${format(rapport.dateRapport, 'dd/MM/yyyy', { locale: fr })})`,
            type: 'file' as const,
            rapport,
            projet: projets.find(p => p.id === rapport.projetId)
          }))
        };

        chantierNode.children!.push(typeNode);
      });

      tree.push(chantierNode);
    });

    return tree;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTreeNode = (node: TreeNode, path: string = '', level: number = 0) => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(fullPath);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={fullPath} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 cursor-pointer ${
            level === 0 ? 'font-semibold' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => hasChildren && toggleFolder(fullPath)}
        >
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </div>
          )}
          
          {node.type === 'folder' ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 text-gray-500" />
          )}
          
          <span className="text-sm">{node.name}</span>
          
          {node.type === 'file' && node.rapport && (
            <div className="flex items-center gap-1 ml-auto">
              <Badge variant="outline" className="text-xs">
                {node.rapport.statut}
              </Badge>
              {node.rapport.pdfUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(node.rapport!.pdfUrl, '_blank');
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, index) => 
              renderTreeNode(child, fullPath, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const tree = organizeRapports();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Arborescence des PDFs
        </CardTitle>
        <p className="text-sm text-gray-600">
          Structure: RAPPORT/PDF/NOMDUCHANTIER/typederapport/nomdufichier.pdf
        </p>
      </CardHeader>
      <CardContent>
        {tree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun rapport avec PDF généré</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((node, index) => renderTreeNode(node, '', 0))}
          </div>
        )}

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Structure de stockage :</h4>
          <div className="text-xs text-blue-700 font-mono">
            <div>RAPPORT/</div>
            <div>├── PDF/</div>
            <div>│   ├── NOMDUCHANTIER/</div>
            <div>│   │   ├── intervention/</div>
            <div>│   │   │   └── NOMDUCHANTIER_intervention_20241215.pdf</div>
            <div>│   │   ├── maintenance/</div>
            <div>│   │   │   └── NOMDUCHANTIER_maintenance_20241210.pdf</div>
            <div>│   │   └── ...</div>
            <div>│   └── AUTRE_CHANTIER/</div>
            <div>│       └── ...</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


