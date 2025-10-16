/**
 * Service pour la gestion des photos des rapports
 * Les photos sont stockées localement et les URLs sont sauvegardées en base
 */
export const photoService = {
  // Uploader une photo et retourner l'URL publique
  async uploadPhoto(file: File, rapportId: string, index: number): Promise<string> {
    try {
      // Créer un nom de fichier unique
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `photo_${index}_${timestamp}.${extension}`;
      
      // Chemin de stockage
      const photoPath = `RAPPORT/IMAGES/${rapportId}/${filename}`;
      
      // Créer le dossier si nécessaire
      const { localStorageService } = await import('./localStorageService');
      await localStorageService.createLocalFolders(`RAPPORT/IMAGES/${rapportId}`);
      
      // Convertir le fichier en buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Écrire le fichier
      const { writeFile } = await import('fs/promises');
      const { join } = await import('path');
      const fullPath = join(process.cwd(), 'public', photoPath);
      
      await writeFile(fullPath, buffer);
      
      // Retourner l'URL publique
      return `/${photoPath}`;
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      throw error;
    }
  },

  // Uploader plusieurs photos
  async uploadPhotos(files: File[], rapportId: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadPhoto(file, rapportId, index)
    );
    
    return Promise.all(uploadPromises);
  },

  // Supprimer une photo
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      const { unlink } = await import('fs/promises');
      const { join } = await import('path');
      const { existsSync } = await import('fs');
      
      // Extraire le chemin du fichier de l'URL
      const filePath = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
      const fullPath = join(process.cwd(), 'public', filePath);
      
      if (existsSync(fullPath)) {
        await unlink(fullPath);
        console.log(`Photo supprimée: ${fullPath}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw error;
    }
  },

  // Supprimer toutes les photos d'un rapport
  async deleteRapportPhotos(rapportId: string): Promise<void> {
    try {
      const { rm } = await import('fs/promises');
      const { join } = await import('path');
      const { existsSync } = await import('fs');
      
      const photosDir = join(process.cwd(), 'public', 'RAPPORT', 'IMAGES', rapportId);
      
      if (existsSync(photosDir)) {
        await rm(photosDir, { recursive: true, force: true });
        console.log(`Dossier photos supprimé: ${photosDir}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier photos:', error);
      throw error;
    }
  }
};


