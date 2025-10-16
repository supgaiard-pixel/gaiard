'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Target,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Agent, Projet, Phase, JalonProjet, Conge } from '@/types';
import { ReportService } from '@/services/reportService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportGeneratorProps {
  agents: Agent[];
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  conges: Conge[];
  selectedAgents?: Agent[];
}

export function ReportGenerator({ 
  agents, 
  projets, 
  phases, 
  jalons, 
  conges,
  selectedAgents 
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerateReport = async (type: 'planning' | 'performance' | 'project', projectId?: string) => {
    setIsGenerating(type);
    
    try {
      let blob: Blob;
      let filename: string;
      
      switch (type) {
        case 'planning':
          blob = await ReportService.generatePlanningReport(
            agents, 
            projets, 
            phases, 
            jalons, 
            conges, 
            selectedAgents
          );
          filename = `rapport-planning-${format(new Date(), 'yyyy-MM-dd-HH-mm', { locale: fr })}.pdf`;
          break;
          
        case 'performance':
          blob = await ReportService.generatePerformanceReport(
            agents, 
            projets, 
            phases, 
            jalons
          );
          filename = `rapport-performance-${format(new Date(), 'yyyy-MM-dd-HH-mm', { locale: fr })}.pdf`;
          break;
          
        case 'project':
          if (!projectId) return;
          const projet = projets.find(p => p.id === projectId);
          if (!projet) return;
          
          const projetPhases = phases.filter(phase => phase.projectId === projectId);
          const projetJalons = jalons.filter(jalon => jalon.projectId === projectId);
          
          blob = await ReportService.generateProjectReport(
            projet, 
            projetPhases, 
            projetJalons, 
            agents
          );
          filename = `rapport-projet-${projet.nom.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`;
          break;
      }
      
      ReportService.downloadReport(blob, filename);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(null);
    }
  };

  const reportTypes = [
    {
      id: 'planning',
      title: 'Rapport de Planning',
      description: 'Planning détaillé par agent avec phases et congés',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: {
        agents: selectedAgents ? selectedAgents.length : agents.length,
        phases: phases.length,
        conges: conges.length
      }
    },
    {
      id: 'performance',
      title: 'Rapport de Performance',
      description: 'Métriques et indicateurs de performance',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: {
        projets: projets.length,
        jalons: jalons.length,
        tauxReussite: jalons.length > 0 ? Math.round((jalons.filter(j => j.statut === 'termine').length / jalons.length) * 100) : 0
      }
    }
  ];

  const projectReports = projets.map(projet => ({
    id: projet.id,
    title: projet.nom,
    description: `Rapport détaillé pour ${projet.nom}`,
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    stats: {
      phases: phases.filter(phase => phase.projectId === projet.id).length,
      jalons: jalons.filter(jalon => jalon.projectId === projet.id).length,
      statut: projet.statut
    }
  }));

  return (
    <div className="space-y-6">
      {/* Rapports généraux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Rapports Généraux</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isGeneratingThis = isGenerating === report.id;
              
              return (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-full ${report.bgColor}`}>
                            <Icon className={`h-5 w-5 ${report.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{report.title}</h3>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mb-3">
                          {Object.entries(report.stats).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key === 'tauxReussite' ? `${value}%` : value} {key}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button
                          onClick={() => handleGenerateReport(report.id as 'planning' | 'performance')}
                          disabled={isGeneratingThis}
                          className="w-full"
                          size="sm"
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Générer PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rapports par projet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Rapports par Projet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectReports.map((project) => {
              const Icon = project.icon;
              const isGeneratingThis = isGenerating === `project-${project.id}`;
              
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-full ${project.bgColor}`}>
                            <Icon className={`h-5 w-5 ${project.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
                            <p className="text-sm text-gray-600">{project.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {project.stats.phases} phases
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.stats.jalons} jalons
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              project.stats.statut === 'termine' ? 'text-green-600 border-green-600' :
                              project.stats.statut === 'en_cours' ? 'text-blue-600 border-blue-600' :
                              'text-gray-600 border-gray-600'
                            }`}
                          >
                            {project.stats.statut}
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={() => handleGenerateReport('project', project.id)}
                          disabled={isGeneratingThis}
                          className="w-full"
                          size="sm"
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Générer PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informations sur les rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur les Rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <strong>Rapport de Planning:</strong> Contient le planning détaillé par agent avec toutes les phases assignées et les congés prévus.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <BarChart3 className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Rapport de Performance:</strong> Analyse des métriques globales, taux de réussite et performance par agent.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <strong>Rapport par Projet:</strong> Détail complet d'un projet avec ses phases, jalons et agents assignés.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}








