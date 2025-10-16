import { Rapport, TypeRapport, Projet } from '@/types';
import { format } from 'date-fns';

// Labels pour les types de rapports
const typeLabels: Record<TypeRapport, string> = {
  [TypeRapport.INTERVENTION]: 'Intervention',
  [TypeRapport.INCIDENCE]: 'Incidence',
  [TypeRapport.VISITE_CHANTIER]: 'Visite_Chantier',
  [TypeRapport.REUNION]: 'Reunion',
  [TypeRapport.SECURITE]: 'Securite',
  [TypeRapport.QUALITE]: 'Qualite',
  [TypeRapport.MAINTENANCE]: 'Maintenance',
  [TypeRapport.RAPPORT_STAGE]: 'Rapport_Stage',
  [TypeRapport.AUTRE]: 'Autre',
};

/**
 * Génère un titre automatique pour un rapport
 * Format: nom_chantier/type_rapport/AAAAMMJJ
 */
export function generateRapportTitle(
  rapport: Rapport, 
  projet?: Projet
): string {
  const nomChantier = projet?.nom || 'Chantier_Inconnu';
  const typeRapport = typeLabels[rapport.type] || 'Rapport';
  const dateFormatee = format(rapport.dateRapport, 'yyyyMMdd');
  
  return `${nomChantier}/${typeRapport}/${dateFormatee}`;
}

/**
 * Génère un titre automatique à partir des paramètres
 */
export function generateRapportTitleFromParams(
  nomChantier: string,
  type: TypeRapport,
  dateRapport: Date
): string {
  const typeRapport = typeLabels[type] || 'Rapport';
  const dateFormatee = format(dateRapport, 'yyyyMMdd');
  
  return `${nomChantier}/${typeRapport}/${dateFormatee}`;
}

/**
 * Nettoie un nom de chantier pour l'utiliser dans un titre
 * Remplace les espaces et caractères spéciaux par des underscores
 */
export function cleanChantierName(nom: string): string {
  return nom
    .replace(/[^a-zA-Z0-9\s]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '_') // Remplace les espaces par des underscores
    .trim();
}

/**
 * Valide qu'un titre de rapport suit le format attendu
 */
export function isValidRapportTitle(titre: string): boolean {
  const pattern = /^[^/]+\/[^/]+\/\d{8}$/;
  return pattern.test(titre);
}

/**
 * Génère un nom de fichier PDF pour l'arborescence
 */
export function generatePDFFileName(
  nomChantier: string,
  typeRapport: string,
  dateRapport: Date
): string {
  const nomChantierNettoye = cleanChantierName(nomChantier);
  const typeRapportNettoye = typeRapport
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  
  const dateFormatee = format(dateRapport, 'yyyyMMdd');
  
  return `${nomChantierNettoye}_${typeRapportNettoye}_${dateFormatee}.pdf`;
}

/**
 * Génère le chemin complet pour le stockage PDF
 */
export function generatePDFStoragePath(
  nomChantier: string,
  typeRapport: string,
  dateRapport: Date
): string {
  const nomChantierNettoye = cleanChantierName(nomChantier);
  const typeRapportNettoye = typeRapport
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  
  const nomFichier = generatePDFFileName(nomChantier, typeRapport, dateRapport);
  
  return `RAPPORT/PDF/${nomChantierNettoye}/${typeRapportNettoye}/${nomFichier}`;
}

/**
 * Extrait les informations d'un titre de rapport
 */
export function parseRapportTitle(titre: string): {
  nomChantier: string;
  typeRapport: string;
  date: string;
} | null {
  if (!isValidRapportTitle(titre)) {
    return null;
  }
  
  const parts = titre.split('/');
  if (parts.length !== 3) {
    return null;
  }
  
  return {
    nomChantier: parts[0],
    typeRapport: parts[1],
    date: parts[2],
  };
}
