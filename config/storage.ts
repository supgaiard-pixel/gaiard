/**
 * Configuration du stockage local
 */
export const storageConfig = {
  // Dossier de base pour les PDFs
  basePath: 'public',
  
  // Structure des dossiers
  structure: {
    rapports: 'RAPPORT/PDF',
    images: 'RAPPORT/IMAGES',
    temp: 'RAPPORT/TEMP'
  },
  
  // Extensions autorisées
  allowedExtensions: {
    pdf: ['.pdf'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  
  // Taille maximale des fichiers (en bytes)
  maxFileSize: {
    pdf: 50 * 1024 * 1024, // 50MB
    image: 10 * 1024 * 1024  // 10MB
  },
  
  // Configuration des dossiers
  folders: {
    // Créer automatiquement les dossiers de base
    autoCreate: true,
    
    // Permissions des dossiers
    permissions: {
      mode: 0o755
    }
  }
};

/**
 * Génère le chemin complet pour un fichier
 */
export function getFullPath(relativePath: string): string {
  return `${storageConfig.basePath}/${relativePath}`;
}

/**
 * Génère l'URL publique pour un fichier
 */
export function getPublicUrl(relativePath: string): string {
  return `/${relativePath}`;
}

/**
 * Valide l'extension d'un fichier
 */
export function isValidExtension(filename: string, type: 'pdf' | 'image'): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const key = type === 'image' ? 'images' : type;
  return storageConfig.allowedExtensions[key].includes(extension);
}

/**
 * Valide la taille d'un fichier
 */
export function isValidFileSize(size: number, type: 'pdf' | 'image'): boolean {
  return size <= storageConfig.maxFileSize[type];
}

