import jsPDF from 'jspdf';
import { Rapport, Agent, Projet } from '@/types';
import { generateRapportTitle } from '@/utils/rapportUtils';
import { imageUrlToBase64, getImageType } from './imageUtils';

// Service pour la génération de PDF
export const pdfService = {
  // Générer un PDF pour un rapport
  async generateRapportPDF(rapport: Rapport, agents: Agent[], projet: Projet): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Configuration des couleurs
    const primaryColor = '#3B82F6';
    const secondaryColor = '#6B7280';
    const textColor = '#1F2937';

    // Fonction pour ajouter du texte avec style
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      doc.setFontSize(options.fontSize || 12);
      doc.setTextColor(options.color || textColor);
      doc.text(text, x, y);
    };

    // Fonction pour dessiner une ligne
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = primaryColor) => {
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.line(x1, y1, x2, y2);
    };

    // En-tête du rapport
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    addText('GAIAR - RAPPORT', 20, 20, { color: '#FFFFFF', fontSize: 16 });
    addText(`Type: ${getTypeRapportLabel(rapport.type)}`, 20, 25, { color: '#FFFFFF', fontSize: 10 });
    
    // Titre automatique
    const titreAutomatique = generateRapportTitle(rapport, projet);
    addText(`Rapport: ${titreAutomatique}`, pageWidth - 20, 20, { color: '#FFFFFF', fontSize: 10 });
    
    yPosition = 40;

    // Informations du rapport
    addText('INFORMATIONS DU RAPPORT', 20, yPosition, { fontSize: 14, color: primaryColor });
    yPosition += 10;
    
    addText(`Titre: ${rapport.titre}`, 20, yPosition);
    yPosition += 8;
    
    addText(`Date: ${rapport.dateRapport.toLocaleDateString('fr-FR')}`, 20, yPosition);
    yPosition += 8;
    
    addText(`Période: ${getPeriodeLabel(rapport.periode)}`, 20, yPosition);
    yPosition += 8;
    
    addText(`Statut: ${getStatutLabel(rapport.statut)}`, 20, yPosition);
    yPosition += 8;
    
    addText(`Type: ${rapport.isExterne ? 'Externe' : 'Interne'}`, 20, yPosition);
    yPosition += 15;

    // Informations du projet
    if (projet) {
      addText('PROJET', 20, yPosition, { fontSize: 14, color: primaryColor });
      yPosition += 10;
      
      addText(`Nom: ${projet.nom}`, 20, yPosition);
      yPosition += 8;
      
      addText(`Client: ${projet.client}`, 20, yPosition);
      yPosition += 8;
      
      addText(`Adresse: ${projet.adresse}`, 20, yPosition);
      yPosition += 15;
    }

    // Agents associés
    if (agents.length > 0) {
      addText('AGENTS ASSOCIÉS', 20, yPosition, { fontSize: 14, color: primaryColor });
      yPosition += 10;
      
      agents.forEach(agent => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        addText(`• ${agent.prenom} ${agent.nom}`, 20, yPosition);
        yPosition += 6;
        
        // Afficher les habilitations si disponibles
        if (agent.habilitations && agent.habilitations.length > 0) {
          addText(`  Habilitations: ${agent.habilitations.join(', ')}`, 20, yPosition);
          yPosition += 6;
        }
        
        yPosition += 5;
      });
    }

    // Description
    if (rapport.description) {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      addText('DESCRIPTION', 20, yPosition, { fontSize: 14, color: primaryColor });
      yPosition += 10;
      
      const descriptionLines = doc.splitTextToSize(rapport.description, pageWidth - 40);
      doc.text(descriptionLines, 20, yPosition);
      yPosition += descriptionLines.length * 6 + 10;
    }

    // Contenu détaillé
    if (rapport.contenu) {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      addText('CONTENU DÉTAILLÉ', 20, yPosition, { fontSize: 14, color: primaryColor });
      yPosition += 10;
      
      const contenuLines = doc.splitTextToSize(rapport.contenu, pageWidth - 40);
      doc.text(contenuLines, 20, yPosition);
      yPosition += contenuLines.length * 6 + 10;
    }

    // Photos du chantier
    if (rapport.photos && rapport.photos.length > 0) {
      console.log(`Génération PDF: ${rapport.photos.length} photos à traiter`);
      
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }
      
      addText('PHOTOS DU CHANTIER', 20, yPosition, { fontSize: 14, color: primaryColor });
      yPosition += 15;
      
      for (let index = 0; index < rapport.photos.length; index++) {
        const photoUrl = rapport.photos[index];
        
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 20;
        }
        
        try {
          console.log(`Traitement de la photo ${index + 1}: ${photoUrl}`);
          
          // Utiliser l'API pour obtenir le base64
          const response = await fetch(`/api/rapports/get-photo-base64?path=${encodeURIComponent(photoUrl)}`);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const { base64, mimeType } = await response.json();
          const imageType = getImageType(photoUrl);
          
          // Ajouter l'image au PDF
          const maxWidth = 150;
          const maxHeight = 100;
          const x = 20;
          
          doc.addImage(`data:${mimeType};base64,${base64}`, imageType, x, yPosition, maxWidth, maxHeight);
          yPosition += maxHeight + 10;
          
          // Ajouter une légende
          addText(`Photo ${index + 1}`, x, yPosition, { fontSize: 10, color: secondaryColor });
          yPosition += 15;
          
          console.log(`Photo ${index + 1} ajoutée au PDF avec succès`);
        } catch (error) {
          console.warn(`Erreur lors de l'ajout de la photo ${index + 1}:`, error);
          // Fallback: afficher l'URL
          addText(`Photo ${index + 1}:`, 20, yPosition, { fontSize: 12, color: secondaryColor });
          yPosition += 6;
          addText(photoUrl, 20, yPosition, { fontSize: 9, color: '#666666' });
          yPosition += 15;
        }
      }
    }

    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addText(`Page ${i} sur ${pageCount}`, pageWidth - 50, pageHeight - 10, { fontSize: 8, color: secondaryColor });
      addText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, pageHeight - 10, { fontSize: 8, color: secondaryColor });
    }

    return doc.output('blob');
  },

  // Générer un PDF simple pour les rapports externes
  async generateSimpleRapportPDF(rapport: Rapport): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // En-tête
    doc.setFillColor('#3B82F6');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(16);
    doc.text('RAPPORT EXTERNE - GAIAR', 20, 18);

    yPosition = 35;

    // Contenu
    doc.setTextColor('#1F2937');
    doc.setFontSize(12);
    doc.text(`Rapport: ${rapport.titre}`, 20, yPosition);
    yPosition += 10;
    
    doc.text(`Date: ${rapport.dateRapport.toLocaleDateString('fr-FR')}`, 20, yPosition);
    yPosition += 10;
    
    if (rapport.description) {
      doc.text('Description:', 20, yPosition);
      yPosition += 8;
      const descriptionLines = doc.splitTextToSize(rapport.description, pageWidth - 40);
      doc.text(descriptionLines, 20, yPosition);
      yPosition += descriptionLines.length * 6 + 10;
    }

    if (rapport.contenu) {
      doc.text('Contenu:', 20, yPosition);
      yPosition += 8;
      const contenuLines = doc.splitTextToSize(rapport.contenu, pageWidth - 40);
      doc.text(contenuLines, 20, yPosition);
    }

    return doc.output('blob');
  }
};

// Fonctions utilitaires pour les labels
function getTypeRapportLabel(type: string): string {
  const labels: Record<string, string> = {
    'intervention': 'Intervention',
    'incidence': 'Incidence',
    'visite_chantier': 'Visite de chantier',
    'reunion': 'Réunion',
    'securite': 'Sécurité',
    'qualite': 'Qualité',
    'maintenance': 'Maintenance',
    'rapport_stage': 'Rapport de stage',
    'autre': 'Autre'
  };
  return labels[type] || type;
}

function getPeriodeLabel(periode: string): string {
  const labels: Record<string, string> = {
    'journalier': 'Journalier',
    'hebdomadaire': 'Hebdomadaire',
    'mensuel': 'Mensuel',
    'ponctuel': 'Ponctuel'
  };
  return labels[periode] || periode;
}

function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    'brouillon': 'Brouillon',
    'en_attente_validation': 'En attente de validation',
    'valide': 'Validé',
    'refuse': 'Refusé',
    'archive': 'Archivé'
  };
  return labels[statut] || statut;
}
