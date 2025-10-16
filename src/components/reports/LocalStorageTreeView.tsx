'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Download,
  RefreshCw,
  HardDrive,
  FolderOpen
} from 'lucide-react';
import { Rapport, Projet } from '@/types';

interface LocalStorageTreeViewProps {
  rapports: Rapport[];
  projets: Projet[];
}

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  rapport?: Rapport;
  projet?: Projet;
  path?: string;
}

export function LocalStorageTreeView({ rapports, projets }: LocalStorageTreeViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
            name: `${rapport.titre} (${rapport.dateRapport.toLocaleDateString('fr-FR')})`,
            type: 'file' as const,
            rapport,
            projet: projets.find(p => p.id === rapport.projetId),
            path: rapport.pdfUrl
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

  const refreshTree = async () => {
    setIsLoading(true);
    try {
      const newTree = organizeRapports();
      setTree(newTree);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTree();
  }, [rapports, projets]);

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
              {node.path && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(node.path, '_blank');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Stockage local
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshTree}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Structure: public/RAPPORT/PDF/NOMDUCHANTIER/typederapport/
        </p>
      </CardHeader>
      <CardContent>
        {tree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun PDF stocké localement</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((node, index) => renderTreeNode(node, '', 0))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
