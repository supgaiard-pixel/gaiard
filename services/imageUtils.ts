/**
 * Utilitaires pour la gestion des images dans les PDFs
 */

/**
 * Convertit une URL d'image en base64
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    console.log(`Tentative de chargement de l'image: ${url}`);
    
    // Construire l'URL complète si c'est un chemin relatif
    const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
    console.log(`URL complète: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log(`Image chargée, taille: ${blob.size} bytes, type: ${blob.type}`);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extraire seulement la partie base64
        const base64 = result.split(',')[1];
        console.log(`Base64 généré, longueur: ${base64.length}`);
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('Erreur FileReader:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erreur lors de la conversion de l\'image:', error);
    throw error;
  }
}

/**
 * Obtient les dimensions d'une image
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

/**
 * Redimensionne une image pour le PDF
 */
export function resizeImageForPDF(originalWidth: number, originalHeight: number, maxWidth: number = 150, maxHeight: number = 100) {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: originalWidth * ratio,
    height: originalHeight * ratio
  };
}

/**
 * Détermine le type d'image à partir de l'URL
 */
export function getImageType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'PNG';
    case 'gif':
      return 'GIF';
    case 'jpg':
    case 'jpeg':
    default:
      return 'JPEG';
  }
}
