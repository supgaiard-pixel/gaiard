// Types pour les agents
export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  habilitations: string[];
  couleur: string; // Couleur d'affichage dans le planning
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les interventions
export interface Intervention {
  id: string;
  titre: string;
  description: string;
  agentId: string; // Référence vers l'agent assigné
  agent?: Agent; // Agent complet (populé)
  dateDebut: Date;
  dateFin: Date;
  duree: number; // en heures
  categorie: CategorieIntervention;
  statut: StatutIntervention;
  adresse: string;
  client: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les congés
export interface Conge {
  id: string;
  agentId: string;
  agent?: Agent; // Agent complet (populé)
  dateDebut: Date;
  dateFin: Date;
  type: TypeConge;
  statut: StatutConge;
  motif: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum CategorieIntervention {
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  REPARATION = 'reparation',
  CONTROLE = 'controle',
  FORMATION = 'formation',
  AUTRE = 'autre'
}

export enum StatutIntervention {
  PLANIFIEE = 'planifiee',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee'
}

export enum TypeConge {
  ANNUEL = 'annuel',
  MALADIE = 'maladie',
  MATERNITE = 'maternite',
  PATERNITE = 'paternite',
  RTT = 'rtt',
  AUTRE = 'autre'
}

export enum StatutConge {
  EN_ATTENTE = 'en_attente',
  VALIDE = 'valide',
  REFUSE = 'refuse'
}

// Types pour les filtres
export interface FiltresPlanning {
  categories: CategorieIntervention[];
  agents: string[];
  statuts: StatutIntervention[];
  dateDebut?: Date;
  dateFin?: Date;
}

// Types pour les jalons (pour les futures évolutions)
export interface Jalon {
  id: string;
  interventionId: string;
  titre: string;
  description: string;
  dateEcheance: Date;
  statut: StatutJalon;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum StatutJalon {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  RETARDE = 'retarde'
}

// Types pour les jalons de projet
export interface JalonProjet {
  id: string;
  projectId: string;
  titre: string;
  description: string;
  dateEcheance: Date;
  type: TypeJalon;
  statut: StatutJalonProjet;
  ordre: number;
  couleur: string; // Couleur d'affichage (par défaut rouge)
  createdAt: Date;
  updatedAt: Date;
}

export enum TypeJalon {
  DEBUT_CHANTIER = 'debut_chantier',
  FIN_PHASE_CRITIQUE = 'fin_phase_critique',
  LIVRAISON_MATERIEL = 'livraison_materiel',
  CONTROLE_TECHNIQUE = 'controle_technique',
  MISE_EN_SERVICE = 'mise_en_service',
  RECEPTION_CLIENT = 'reception_client',
  AUTRE = 'autre'
}

export enum StatutJalonProjet {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  RETARDE = 'retarde',
  ANNULE = 'annule'
}

// Types pour les projets
export interface Projet {
  id: string;
  nom: string;
  description: string;
  client: string;
  adresse: string;
  dateDebut: Date;
  dateFin: Date;
  statut: StatutProjet;
  couleur: string; // Couleur d'affichage dans la timeline
  phases: Phase[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les créneaux de phase
export interface Creneau {
  id: string;
  dateDebut: Date;
  dateFin: Date;
  duree: number; // en jours
  couleur?: string; // Couleur spécifique pour ce créneau (optionnel)
}

// Types pour les phases de projet
export interface Phase {
  id: string;
  projectId: string;
  nom: string;
  description: string;
  dateDebut: Date; // Date de début du premier créneau
  dateFin: Date; // Date de fin du dernier créneau
  duree: number; // en jours (somme de tous les créneaux)
  statut: StatutPhase;
  agents: string[]; // IDs des agents affectés
  agentsDetails?: Agent[]; // Agents complets (populés)
  ordre: number; // Ordre d'affichage dans la timeline
  couleur: string; // Couleur d'affichage par défaut
  creneaux: Creneau[]; // Créneaux de travail multiples
  createdAt: Date;
  updatedAt: Date;
}

export enum StatutProjet {
  EN_PREPARATION = 'en_preparation',
  EN_COURS = 'en_cours',
  EN_PAUSE = 'en_pause',
  TERMINE = 'termine',
  ANNULE = 'annule'
}

export enum StatutPhase {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  RETARDE = 'retarde',
  ANNULE = 'annule'
}

// Types pour les rapports
export interface Rapport {
  id: string;
  titre: string;
  description: string;
  contenu: string; // Contenu détaillé du rapport
  type: TypeRapport;
  projetId: string;
  projet?: Projet; // Projet complet (populé)
  redacteurId?: string; // ID de l'agent rédacteur (null pour rapports externes)
  redacteur?: Agent; // Agent rédacteur (populé)
  agentsIds: string[]; // IDs des agents associés
  agents?: Agent[]; // Agents complets (populés)
  dateRapport: Date; // Date du rapport
  periode: PeriodeRapport;
  statut: StatutRapport;
  isExterne: boolean; // true pour rapports externes (sans authentification)
  tokenAcces?: string; // Token d'accès pour les rapports externes
  qrCode?: string; // URL du QR code
  pdfUrl?: string; // URL du PDF stocké
  pdfPath?: string; // Chemin du PDF dans le storage
  photos?: string[]; // URLs des photos du chantier
  createdAt: Date;
  updatedAt: Date;
}

export enum TypeRapport {
  INTERVENTION = 'intervention',
  INCIDENCE = 'incidence',
  VISITE_CHANTIER = 'visite_chantier',
  REUNION = 'reunion',
  SECURITE = 'securite',
  QUALITE = 'qualite',
  MAINTENANCE = 'maintenance',
  RAPPORT_STAGE = 'rapport_stage',
  AUTRE = 'autre'
}

export enum PeriodeRapport {
  JOURNALIER = 'journalier',
  HEBDOMADAIRE = 'hebdomadaire',
  MENSUEL = 'mensuel',
  PONCTUEL = 'ponctuel'
}

export enum StatutRapport {
  BROUILLON = 'brouillon',
  EN_ATTENTE_VALIDATION = 'en_attente_validation',
  VALIDE = 'valide',
  REFUSE = 'refuse',
  ARCHIVE = 'archive'
}

// Types pour les filtres de rapports
export interface FiltresRapports {
  types: TypeRapport[];
  projets: string[];
  agents: string[];
  statuts: StatutRapport[];
  periodes: PeriodeRapport[];
  dateDebut?: Date;
  dateFin?: Date;
  isExterne?: boolean;
}

// Types pour les modèles de rapport
export interface ModeleRapport {
  id: string;
  nom: string;
  type: TypeRapport;
  template: string; // Template HTML/Markdown
  champs: ChampRapport[];
  isActif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChampRapport {
  id: string;
  nom: string;
  type: TypeChamp;
  obligatoire: boolean;
  options?: string[]; // Pour les champs select/radio
  ordre: number;
}

export enum TypeChamp {
  TEXTE = 'texte',
  TEXTE_LONG = 'texte_long',
  NOMBRE = 'nombre',
  DATE = 'date',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  FICHIER = 'fichier'
}
