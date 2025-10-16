import jsPDF from 'jspdf';
import { Projet, Phase, JalonProjet, Agent } from '@/types';

interface TimelineExportOptions {
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  agents: Agent[];
  dateDebut?: Date;
  dateFin?: Date;
  titre?: string;
  includeLegend?: boolean;
  includeStats?: boolean;
}

interface TimelineStats {
  totalProjets: number;
  totalPhases: number;
  totalJalons: number;
  projetsEnCours: number;
  phasesEnCours: number;
  jalonsEnRetard: number;
  jalonsTermines: number;
}

export class TimelineExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('l', 'mm', 'a4'); // Paysage
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async exportTimeline(options: TimelineExportOptions): Promise<string> {
    const { projets, phases, jalons, agents, dateDebut, dateFin, titre, includeLegend = true, includeStats = true } = options;

    // En-tête
    this.addHeader(titre || 'Timeline des projets', new Date());

    // Statistiques
    if (includeStats) {
      const stats = this.calculateStats(projets, phases, jalons);
      this.addStats(stats);
    }

    // Légende
    if (includeLegend) {
      this.addLegend();
    }

    // Liste des projets
    this.addProjectsList(projets, phases, jalons, agents);

    // Diagramme de Gantt simplifié
    this.addGanttChart(projets, phases, jalons, dateDebut, dateFin);

    // Pied de page
    this.addFooter();

    // Générer le PDF
    const pdfBlob = this.doc.output('blob');
    return URL.createObjectURL(pdfBlob);
  }

  private addHeader(titre: string, date: Date): void {
    // Titre principal
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(titre, this.margin, this.currentY);
    this.currentY += 10;

    // Date de génération
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Généré le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}`, this.margin, this.currentY);
    this.currentY += 15;

    // Ligne de séparation
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private calculateStats(projets: Projet[], phases: Phase[], jalons: JalonProjet[]): TimelineStats {
    const today = new Date();
    
    return {
      totalProjets: projets.length,
      totalPhases: phases.length,
      totalJalons: jalons.length,
      projetsEnCours: projets.filter(p => p.statut === 'en_cours').length,
      phasesEnCours: phases.filter(p => p.statut === 'en_cours').length,
      jalonsEnRetard: jalons.filter(j => {
        const echeance = new Date(j.dateEcheance);
        return echeance < today && j.statut !== 'termine';
      }).length,
      jalonsTermines: jalons.filter(j => j.statut === 'termine').length,
    };
  }

  private addStats(stats: TimelineStats): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Statistiques', this.margin, this.currentY);
    this.currentY += 8;

    // Tableau des statistiques
    const statsData = [
      ['Métrique', 'Valeur'],
      ['Projets total', stats.totalProjets.toString()],
      ['Projets en cours', stats.projetsEnCours.toString()],
      ['Phases total', stats.totalPhases.toString()],
      ['Phases en cours', stats.phasesEnCours.toString()],
      ['Jalons total', stats.totalJalons.toString()],
      ['Jalons terminés', stats.jalonsTermines.toString()],
      ['Jalons en retard', stats.jalonsEnRetard.toString()],
    ];

    this.addTable(statsData, this.margin, this.currentY, 80, 15);
    this.currentY += (statsData.length * 15) + 20;
  }

  private addLegend(): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Légende', this.margin, this.currentY);
    this.currentY += 8;

    // Statuts de projet
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Statuts de projet:', this.margin, this.currentY);
    this.currentY += 5;

    const statutsProjet = [
      { label: 'En préparation', color: [255, 193, 7] },
      { label: 'En cours', color: [33, 150, 243] },
      { label: 'En pause', color: [255, 152, 0] },
      { label: 'Terminé', color: [76, 175, 80] },
      { label: 'Annulé', color: [158, 158, 158] },
    ];

    statutsProjet.forEach((statut, index) => {
      const x = this.margin + (index % 2) * 80;
      const y = this.currentY + Math.floor(index / 2) * 6;
      
      // Carré de couleur
      this.doc.setFillColor(statut.color[0], statut.color[1], statut.color[2]);
      this.doc.rect(x, y - 3, 3, 3, 'F');
      
      // Texte
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(statut.label, x + 5, y);
    });

    this.currentY += 20;
  }

  private addProjectsList(projets: Projet[], phases: Phase[], jalons: JalonProjet[], agents: Agent[]): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Liste des projets', this.margin, this.currentY);
    this.currentY += 8;

    projets.forEach((projet, index) => {
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Nom du projet
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${projet.nom}`, this.margin, this.currentY);
      this.currentY += 6;

      // Informations du projet
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Client: ${projet.client}`, this.margin + 10, this.currentY);
      this.doc.text(`Statut: ${projet.statut}`, this.margin + 100, this.currentY);
      this.doc.text(`Période: ${projet.dateDebut.toLocaleDateString('fr-FR')} - ${projet.dateFin.toLocaleDateString('fr-FR')}`, this.margin + 150, this.currentY);
      this.currentY += 5;

      // Phases du projet
      const projetPhases = phases.filter(p => p.projectId === projet.id);
      if (projetPhases.length > 0) {
        this.doc.text('Phases:', this.margin + 10, this.currentY);
        this.currentY += 4;
        
        projetPhases.forEach((phase, phaseIndex) => {
          this.doc.text(`  ${phaseIndex + 1}. ${phase.nom} (${phase.statut})`, this.margin + 20, this.currentY);
          this.currentY += 4;
        });
      }

      // Jalons du projet
      const projetJalons = jalons.filter(j => j.projectId === projet.id);
      if (projetJalons.length > 0) {
        this.doc.text('Jalons:', this.margin + 10, this.currentY);
        this.currentY += 4;
        
        projetJalons.forEach((jalon, jalonIndex) => {
          const isOverdue = new Date(jalon.dateEcheance) < new Date() && jalon.statut !== 'termine';
          const overdueText = isOverdue ? ' (EN RETARD)' : '';
          this.doc.text(`  ${jalonIndex + 1}. ${jalon.titre} - ${jalon.dateEcheance.toLocaleDateString('fr-FR')}${overdueText}`, this.margin + 20, this.currentY);
          this.currentY += 4;
        });
      }

      this.currentY += 10;
    });
  }

  private addGanttChart(projets: Projet[], phases: Phase[], jalons: JalonProjet[], dateDebut?: Date, dateFin?: Date): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Diagramme de Gantt', this.margin, this.currentY);
    this.currentY += 8;

    // Calculer la plage de dates
    const startDate = dateDebut || new Date(Math.min(...phases.map(p => p.dateDebut.getTime())));
    const endDate = dateFin || new Date(Math.max(...phases.map(p => p.dateFin.getTime())));
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // En-tête du diagramme
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Projet/Phase', this.margin, this.currentY);
    this.doc.text('Période', this.margin + 80, this.currentY);
    this.doc.text('Statut', this.margin + 150, this.currentY);
    this.doc.text('Durée', this.margin + 200, this.currentY);
    this.currentY += 6;

    // Ligne de séparation
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 4;

    // Lignes des projets et phases
    projets.forEach(projet => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Ligne du projet
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`📁 ${projet.nom}`, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${projet.dateDebut.toLocaleDateString('fr-FR')} - ${projet.dateFin.toLocaleDateString('fr-FR')}`, this.margin + 80, this.currentY);
      this.doc.text(projet.statut, this.margin + 150, this.currentY);
      
      const projetDuration = Math.ceil((projet.dateFin.getTime() - projet.dateDebut.getTime()) / (1000 * 60 * 60 * 24));
      this.doc.text(`${projetDuration} jours`, this.margin + 200, this.currentY);
      this.currentY += 5;

      // Phases du projet
      const projetPhases = phases.filter(p => p.projectId === projet.id);
      projetPhases.forEach(phase => {
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage();
          this.currentY = this.margin;
        }

        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`  └─ ${phase.nom}`, this.margin, this.currentY);
        this.doc.text(`${phase.dateDebut.toLocaleDateString('fr-FR')} - ${phase.dateFin.toLocaleDateString('fr-FR')}`, this.margin + 80, this.currentY);
        this.doc.text(phase.statut, this.margin + 150, this.currentY);
        
        const phaseDuration = Math.ceil((phase.dateFin.getTime() - phase.dateDebut.getTime()) / (1000 * 60 * 60 * 24));
        this.doc.text(`${phaseDuration} jours`, this.margin + 200, this.currentY);
        this.currentY += 4;
      });

      this.currentY += 3;
    });
  }

  private addTable(data: string[][], x: number, y: number, colWidth: number, rowHeight: number): void {
    const numRows = data.length;
    const numCols = data[0].length;

    // Dessiner les lignes
    for (let i = 0; i <= numRows; i++) {
      this.doc.line(x, y + i * rowHeight, x + colWidth * numCols, y + i * rowHeight);
    }
    for (let j = 0; j <= numCols; j++) {
      this.doc.line(x + j * colWidth, y, x + j * colWidth, y + numRows * rowHeight);
    }

    // Ajouter le texte
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
        this.doc.text(cell, x + colIndex * colWidth + 2, y + (rowIndex + 1) * rowHeight - 3);
      });
    });
  }

  private addFooter(): void {
    const pageNumber = (this.doc as any).internal.getNumberOfPages();
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Page ${pageNumber}`, this.pageWidth - 30, this.pageHeight - 10);
    this.doc.text('Généré par GAIAR Timeline', this.margin, this.pageHeight - 10);
  }
}

export const timelineExportService = new TimelineExportService();
