import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from '@/lib/firebase';
import { generatePDFStoragePath } from '@/utils/rapportUtils';

/**
 * Service de stockage simplifié qui évite les erreurs de retry
 */
export const storageServiceSimple = {
  // Uploader un PDF de rapport sans création de dossiers
  async uploadRapportPDF(rapportId: string, pdfBlob: Blob, nomChantier: string, typeRapport: string, dateRapport?: Date): Promise<string> {
    try {
      const storage = await getStorage();
      
      // Utiliser la date du rapport ou la date actuelle
      const date = dateRapport || new Date();
      
      // Générer le chemin organisé : RAPPORT/PDF/NOMDUCHANTIER/typederapport/nomdufichier.pdf
      const pdfPath = generatePDFStoragePath(nomChantier, typeRapport, date);
      
      // Upload direct sans création de dossiers
      // Firebase Storage créera automatiquement les dossiers nécessaires
      const pdfRef = ref(storage, pdfPath);
      
      console.log(`Upload du PDF vers: ${pdfPath}`);
      
      // Upload avec un seul essai pour éviter les erreurs de retry
      await uploadBytes(pdfRef, pdfBlob);
      const downloadURL = await getDownloadURL(pdfRef);
      
      console.log(`PDF uploadé avec succès: ${pdfPath}`);
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors de l\'upload du PDF:', error);
      throw error;
    }
  },

  // Uploader une image simple
  async uploadRapportImage(rapportId: string, imageBlob: Blob, filename: string): Promise<string> {
    try {
      const storage = await getStorage();
      const imageRef = ref(storage, `rapports/${rapportId}/images/${filename}`);
      
      await uploadBytes(imageRef, imageBlob);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw error;
    }
  }
};


