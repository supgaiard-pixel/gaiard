import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getStorage } from '@/lib/firebase';
import { generatePDFStoragePath } from '@/utils/rapportUtils';
import { createRapportFolderStructure } from '@/utils/storageUtils';

/**
 * Upload un fichier avec retry et timeout
 */
async function uploadBytesWithRetry(
  fileRef: any, 
  blob: Blob, 
  maxRetries: number = 3,
  delay: number = 2000
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await uploadBytes(fileRef, blob);
      return;
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Tentative ${attempt}/${maxRetries} échouée pour l'upload, retry dans ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Augmenter le délai progressivement
    }
  }
}

// Service pour le stockage des fichiers
export const storageService = {

  // Uploader un PDF de rapport avec arborescence organisée
  async uploadRapportPDF(rapportId: string, pdfBlob: Blob, nomChantier: string, typeRapport: string, dateRapport?: Date): Promise<string> {
    try {
      const storage = await getStorage();
      
      // Utiliser la date du rapport ou la date actuelle
      const date = dateRapport || new Date();
      
      // Nettoyer les noms pour l'arborescence
      const nomChantierNettoye = nomChantier
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      
      const typeRapportNettoye = typeRapport
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      
      // Générer le chemin organisé : RAPPORT/PDF/NOMDUCHANTIER/typederapport/nomdufichier.pdf
      const pdfPath = generatePDFStoragePath(nomChantier, typeRapport, date);
      
      // Créer l'arborescence complète avant l'upload (avec timeout et gestion d'erreur)
      try {
        // Timeout de 5 secondes pour la création des dossiers
        await Promise.race([
          createRapportFolderStructure(storage, nomChantierNettoye, typeRapportNettoye),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout création dossiers')), 5000)
          )
        ]);
        console.log('Arborescence créée avec succès');
      } catch (error) {
        console.warn('Erreur lors de la création des dossiers, continuation de l\'upload:', error);
        // Continuer même si la création des dossiers échoue
        // Firebase Storage créera automatiquement les dossiers lors de l'upload
      }
      
      // Upload du PDF avec retry
      const pdfRef = ref(storage, pdfPath);
      await uploadBytesWithRetry(pdfRef, pdfBlob);
      const downloadURL = await getDownloadURL(pdfRef);
      
      console.log(`PDF stocké dans: ${pdfPath}`);
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors de l\'upload du PDF:', error);
      throw error;
    }
  },

  // Uploader une image (pour les rapports avec photos)
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
  },

  // Supprimer un fichier
  async deleteFile(filePath: string): Promise<void> {
    try {
      const storage = await getStorage();
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  },

  // Supprimer tous les fichiers d'un rapport
  async deleteRapportFiles(rapportId: string): Promise<void> {
    try {
      const storage = await getStorage();
      const rapportRef = ref(storage, `rapports/${rapportId}`);
      
      // Note: Firebase Storage ne permet pas de supprimer un dossier entier
      // Il faut supprimer chaque fichier individuellement
      // Cette fonction devrait être étendue pour lister et supprimer tous les fichiers
      console.warn('Suppression des fichiers du rapport non implémentée complètement');
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers du rapport:', error);
      throw error;
    }
  }
};
