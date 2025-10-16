import { ref, uploadString } from 'firebase/storage';

/**
 * Crée une structure de dossiers dans Firebase Storage avec retry et timeout
 * Firebase Storage ne supporte pas les dossiers vides, donc on utilise des fichiers .keep
 */
export async function createStorageFolders(storage: any, folderPath: string): Promise<void> {
  try {
    // Diviser le chemin en segments
    const segments = folderPath.split('/').filter(segment => segment.length > 0);
    
    // Créer chaque niveau de dossier avec retry
    for (let i = 1; i <= segments.length; i++) {
      const currentPath = segments.slice(0, i).join('/');
      const keepFilePath = `${currentPath}/.keep`;
      
      await createFolderWithRetry(storage, keepFilePath, currentPath);
    }
  } catch (error) {
    console.warn('Erreur lors de la création des dossiers:', error);
    // Ne pas faire échouer l'opération principale
  }
}

/**
 * Crée un dossier avec retry et timeout
 */
async function createFolderWithRetry(
  storage: any, 
  keepFilePath: string, 
  currentPath: string, 
  maxRetries: number = 3,
  delay: number = 1000
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const keepRef = ref(storage, keepFilePath);
      await uploadString(keepRef, '', 'raw');
      console.log(`Dossier créé: ${currentPath}`);
      return;
    } catch (error: any) {
      // Ignorer les erreurs si le fichier existe déjà
      if (error.code === 'storage/object-not-found' || 
          error.message?.includes('already exists') ||
          error.code === 'storage/unauthorized') {
        console.log(`Dossier ${currentPath} existe déjà`);
        return;
      }
      
      // Si c'est la dernière tentative, log l'erreur
      if (attempt === maxRetries) {
        console.warn(`Erreur lors de la création du dossier ${currentPath} après ${maxRetries} tentatives:`, error);
        return;
      }
      
      // Attendre avant la prochaine tentative
      console.log(`Tentative ${attempt}/${maxRetries} échouée pour ${currentPath}, retry dans ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Augmenter le délai exponentiellement
    }
  }
}

/**
 * Vérifie si un dossier existe dans Firebase Storage
 */
export async function folderExists(storage: any, folderPath: string): Promise<boolean> {
  try {
    const keepRef = ref(storage, `${folderPath}/.keep`);
    await uploadString(keepRef, '', 'raw');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Crée l'arborescence complète pour un rapport PDF
 */
export async function createRapportFolderStructure(
  storage: any, 
  nomChantier: string, 
  typeRapport: string
): Promise<void> {
  const basePath = 'RAPPORT/PDF';
  const chantierPath = `${basePath}/${nomChantier}`;
  const typePath = `${chantierPath}/${typeRapport}`;
  
  // Créer la structure complète
  await createStorageFolders(storage, basePath);
  await createStorageFolders(storage, chantierPath);
  await createStorageFolders(storage, typePath);
  
  console.log(`Structure de dossiers créée pour: ${typePath}`);
}
