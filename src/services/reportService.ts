import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Agent, Projet, Phase, JalonProjet, Conge } from '@/types';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

export class ReportService {
  
  // Générer un rapport de planning
  static async generatePlanningReport(
    agents: Agent[],
    projets: Projet[],
    phases: Phase[],
    jalons: JalonProjet[],
    conges: Conge[],
    selectedAgents?: Agent[]
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport de Planning', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Filtres appliqués
    if (selectedAgents && selectedAgents.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Agents sélectionnés:', 20, yPosition);
      yPosition += 8;
      
      selectedAgents.forEach(agent => {
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${agent.prenom} ${agent.nom}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Résumé des métriques
    const totalAgents = selectedAgents ? selectedAgents.length : agents.length;
    const totalProjets = projets.length;
    const totalPhases = phases.length;
    const totalJalons = jalons.length;
    const jalonsEnRetard = jalons.filter(j => isPast(j.dateEcheance) && j.statut !== 'termine').length;
    const agentsEnConge = conges.filter(c => {
      const aujourdhui = new Date();
      return aujourdhui >= c.dateDebut && aujourdhui <= c.dateFin;
    }).length;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé des Métriques', 20, yPosition);
    yPosition += 15;

    const metrics = [
      `Agents actifs: ${totalAgents}`,
      `Projets: ${totalProjets}`,
      `Phases: ${totalPhases}`,
      `Jalons: ${totalJalons}`,
      `Jalons en retard: ${jalonsEnRetard}`,
      `Agents en congé: ${agentsEnConge}`
    ];

    metrics.forEach(metric => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(metric, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Détail par agent
    const agentsToShow = selectedAgents || agents;
    agentsToShow.forEach(agent => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${agent.prenom} ${agent.nom}`, 20, yPosition);
      yPosition += 10;

      // Phases de l'agent
      const agentPhases = phases.filter(phase => phase.agents.includes(agent.id));
      if (agentPhases.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Phases assignées:', 25, yPosition);
        yPosition += 8;

        agentPhases.forEach(phase => {
          const projet = projets.find(p => p.id === phase.projectId);
          const statut = phase.statut === 'termine' ? 'Terminé' : 
                       phase.statut === 'en_cours' ? 'En cours' : 'En attente';
          
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${phase.nom} (${projet?.nom || 'Projet inconnu'})`, 30, yPosition);
          doc.text(`  Statut: ${statut}`, 30, yPosition + 4);
          doc.text(`  Période: ${format(phase.dateDebut, 'dd/MM/yyyy')} - ${format(phase.dateFin, 'dd/MM/yyyy')}`, 30, yPosition + 8);
          yPosition += 15;
        });
      }

      // Congés de l'agent
      const agentConges = conges.filter(conge => conge.agentId === agent.id);
      if (agentConges.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Congés:', 25, yPosition);
        yPosition += 8;

        agentConges.forEach(conge => {
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${conge.type}`, 30, yPosition);
          doc.text(`  Période: ${format(conge.dateDebut, 'dd/MM/yyyy')} - ${format(conge.dateFin, 'dd/MM/yyyy')}`, 30, yPosition + 4);
          yPosition += 10;
        });
      }

      yPosition += 15;
    });

    // Jalons critiques
    const jalonsCritiques = jalons.filter(jalon => {
      const joursRestants = differenceInDays(jalon.dateEcheance, new Date());
      return joursRestants <= 7 && joursRestants >= 0 && jalon.statut !== 'termine';
    });

    if (jalonsCritiques.length > 0) {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Jalons Critiques', 20, yPosition);
      yPosition += 15;

      jalonsCritiques.forEach(jalon => {
        const projet = projets.find(p => p.id === jalon.projectId);
        const joursRestants = differenceInDays(jalon.dateEcheance, new Date());
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${jalon.titre} (${projet?.nom || 'Projet inconnu'})`, 25, yPosition);
        doc.text(`  Échéance: ${format(jalon.dateEcheance, 'dd/MM/yyyy')} (dans ${joursRestants} jour(s))`, 25, yPosition + 4);
        yPosition += 12;
      });
    }

    return doc.output('blob');
  }

  // Générer un rapport de projet
  static async generateProjectReport(
    projet: Projet,
    phases: Phase[],
    jalons: JalonProjet[],
    agents: Agent[]
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(projet.nom, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rapport généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Informations du projet
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations du Projet', 20, yPosition);
    yPosition += 15;

    const projectInfo = [
      `Client: ${projet.client}`,
      `Adresse: ${projet.adresse}`,
      `Période: ${format(projet.dateDebut, 'dd/MM/yyyy')} - ${format(projet.dateFin, 'dd/MM/yyyy')}`,
      `Statut: ${projet.statut === 'en_cours' ? 'En cours' : projet.statut === 'termine' ? 'Terminé' : 'En attente'}`,
      `Description: ${projet.description}`
    ];

    projectInfo.forEach(info => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(info, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 15;

    // Phases du projet
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Phases du Projet', 20, yPosition);
    yPosition += 15;

    phases.forEach((phase, index) => {
      const statut = phase.statut === 'termine' ? 'Terminé' : 
                   phase.statut === 'en_cours' ? 'En cours' : 'En attente';
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${phase.nom}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Statut: ${statut}`, 25, yPosition);
      doc.text(`Période: ${format(phase.dateDebut, 'dd/MM/yyyy')} - ${format(phase.dateFin, 'dd/MM/yyyy')}`, 25, yPosition + 4);
      doc.text(`Durée: ${phase.duree} jour(s)`, 25, yPosition + 8);
      
      // Agents assignés
      const agentsPhase = agents.filter(agent => phase.agents.includes(agent.id));
      if (agentsPhase.length > 0) {
        doc.text(`Agents: ${agentsPhase.map(a => `${a.prenom} ${a.nom}`).join(', ')}`, 25, yPosition + 12);
        yPosition += 20;
      } else {
        yPosition += 15;
      }
    });

    // Jalons du projet
    if (jalons.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Jalons du Projet', 20, yPosition);
      yPosition += 15;

      jalons.forEach((jalon, index) => {
        const statut = jalon.statut === 'termine' ? 'Terminé' : 
                     jalon.statut === 'en_cours' ? 'En cours' : 'En attente';
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${jalon.titre}`, 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Statut: ${statut}`, 25, yPosition);
        doc.text(`Échéance: ${format(jalon.dateEcheance, 'dd/MM/yyyy')}`, 25, yPosition + 4);
        if (jalon.description) {
          doc.text(`Description: ${jalon.description}`, 25, yPosition + 8);
          yPosition += 15;
        } else {
          yPosition += 12;
        }
      });
    }

    return doc.output('blob');
  }

  // Générer un rapport de performance
  static async generatePerformanceReport(
    agents: Agent[],
    projets: Projet[],
    phases: Phase[],
    jalons: JalonProjet[]
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport de Performance', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Métriques globales
    const totalProjets = projets.length;
    const projetsEnCours = projets.filter(p => p.statut === 'en_cours').length;
    const projetsTermines = projets.filter(p => p.statut === 'termine').length;
    const totalPhases = phases.length;
    const phasesTerminees = phases.filter(p => p.statut === 'termine').length;
    const totalJalons = jalons.length;
    const jalonsTermines = jalons.filter(j => j.statut === 'termine').length;
    const jalonsEnRetard = jalons.filter(j => isPast(j.dateEcheance) && j.statut !== 'termine').length;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Métriques Globales', 20, yPosition);
    yPosition += 15;

    const globalMetrics = [
      `Projets: ${totalProjets} (${projetsEnCours} en cours, ${projetsTermines} terminés)`,
      `Phases: ${totalPhases} (${phasesTerminees} terminées)`,
      `Jalons: ${totalJalons} (${jalonsTermines} terminés, ${jalonsEnRetard} en retard)`,
      `Taux de réussite jalons: ${totalJalons > 0 ? Math.round((jalonsTermines / totalJalons) * 100) : 0}%`
    ];

    globalMetrics.forEach(metric => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(metric, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 15;

    // Performance par agent
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance par Agent', 20, yPosition);
    yPosition += 15;

    agents.forEach(agent => {
      const agentPhases = phases.filter(phase => phase.agents.includes(agent.id));
      const phasesTerminees = agentPhases.filter(phase => phase.statut === 'termine').length;
      const tauxReussite = agentPhases.length > 0 ? Math.round((phasesTerminees / agentPhases.length) * 100) : 0;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${agent.prenom} ${agent.nom}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Phases assignées: ${agentPhases.length}`, 25, yPosition);
      doc.text(`Phases terminées: ${phasesTerminees}`, 25, yPosition + 4);
      doc.text(`Taux de réussite: ${tauxReussite}%`, 25, yPosition + 8);
      yPosition += 15;
    });

    return doc.output('blob');
  }

  // Télécharger un rapport
  static downloadReport(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}








