// Service pour la génération de QR codes
export const qrCodeService = {
  // Générer un QR code pour un rapport externe
  async generateQRCode(rapportId: string, baseUrl: string = window.location.origin): Promise<string> {
    const url = `${baseUrl}/rapports/externe/${rapportId}`;
    
    // Utilisation d'une API publique pour générer le QR code
    // En production, vous pourriez utiliser une bibliothèque comme qrcode.js
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    return qrCodeUrl;
  },

  // Générer un lien d'accès pour un rapport externe
  generateAccessLink(rapportId: string, token: string, baseUrl: string = window.location.origin): string {
    return `${baseUrl}/rapports/externe/${rapportId}?token=${token}`;
  },

  // Valider un token d'accès
  async validateToken(token: string): Promise<boolean> {
    try {
      // Ici vous pourriez ajouter une validation côté serveur
      // Pour l'instant, on considère que le token est valide s'il n'est pas vide
      return Boolean(token && token.length > 10);
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  }
};

