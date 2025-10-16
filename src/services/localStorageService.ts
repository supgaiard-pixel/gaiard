import { generatePDFStoragePath, generatePDFFileName } from '@/utils/rapportUtils';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Service de stockage local pour les PDFs
 */
export const localStorageService = {
  // Créer l'arborescence de dossiers localement
  async createLocalFolders(basePath: string): Promise<void> {
    try {
      const segments = basePath.split('/').filter(segment => segment.length > 0);
      
      for (let i = 1; i <= segments.length; i++) {
        const currentPath = segments.slice(0, i).join('/');
        const fullPath = join(process.cwd(), 'public', currentPath);
        
        if (!existsSync(fullPath)) {
          await mkdir(fullPath, { recursive: true });
          console.log(`Dossier créé: ${fullPath}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création des dossiers locaux:', error);
      throw error;
    }
  },

  // Uploader un PDF de rapport localement
  async uploadRapportPDF(
    rapportId: string, 
    pdfBlob: Blob, 
    nomChantier: string, 
    typeRapport: string, 
    dateRapport?: Date
  ): Promise<string> {
    try {
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
      
      // Générer le chemin organisé
      const pdfPath = generatePDFStoragePath(nomChantier, typeRapport, date);
      const fileName = generatePDFFileName(nomChantier, typeRapport, date);
      
      // Chemin complet sur le serveur
      const fullPath = join(process.cwd(), 'public', pdfPath);
      const directoryPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
      
      // Créer les dossiers si nécessaire
      await this.createLocalFolders(pdfPath.substring(0, pdfPath.lastIndexOf('/')));
      
      // Convertir le Blob en Buffer
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Écrire le fichier
      await writeFile(fullPath, buffer);
      
      // Retourner l'URL publique
      const publicUrl = `/${pdfPath}`;
      
      console.log(`PDF stocké localement: ${fullPath}`);
      console.log(`URL publique: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload local du PDF:', error);
      throw error;
    }
  },

  // Uploader une image localement
  async uploadRapportImage(rapportId: string, imageBlob: Blob, filename: string): Promise<string> {
    try {
      const imagePath = `rapports/${rapportId}/images/${filename}`;
      const fullPath = join(process.cwd(), 'public', imagePath);
      const directoryPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
      
      // Créer le dossier si nécessaire
      if (!existsSync(directoryPath)) {
        await mkdir(directoryPath, { recursive: true });
      }
      
      // Convertir le Blob en Buffer
      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Écrire le fichier
      await writeFile(fullPath, buffer);
      
      // Retourner l'URL publique
      const publicUrl = `/${imagePath}`;
      
      console.log(`Image stockée localement: ${fullPath}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload local de l\'image:', error);
      throw error;
    }
  },

  // Supprimer un fichier local
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), 'public', filePath);
      
      if (existsSync(fullPath)) {
        await import('fs/promises').then(fs => fs.unlink(fullPath));
        console.log(`Fichier supprimé: ${fullPath}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  },

  // Lister les fichiers dans un dossier
  async listFiles(directoryPath: string): Promise<string[]> {
    try {
      const fullPath = join(process.cwd(), 'public', directoryPath);
      
      if (!existsSync(fullPath)) {
        return [];
      }
      
      const { readdir } = await import('fs/promises');
      const files = await readdir(fullPath, { recursive: true });
      
      return files.filter(file => typeof file === 'string' && file.endsWith('.pdf'));
    } catch (error) {
      console.error('Erreur lors de la lecture du dossier:', error);
      return [];
    }
  }
};


