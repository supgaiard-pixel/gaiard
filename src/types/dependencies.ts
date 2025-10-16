// Types pour les dépendances entre phases et jalons

export interface Dependance {
  id: string;
  sourceId: string; // ID de la phase ou jalon source
  targetId: string; // ID de la phase ou jalon cible
  type: TypeDependance;
  statut: StatutDependance;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TypeDependance {
  FIN_TO_DEBUT = 'fin_to_debut', // La phase source doit se terminer avant que la phase cible commence
  DEBUT_TO_DEBUT = 'debut_to_debut', // Les deux phases doivent commencer en même temps
  FIN_TO_FIN = 'fin_to_fin', // Les deux phases doivent se terminer en même temps
  DEBUT_TO_FIN = 'debut_to_fin', // La phase source doit commencer avant que la phase cible se termine
  JALON_TO_PHASE = 'jalon_to_phase', // Un jalon doit être atteint avant qu'une phase commence
  PHASE_TO_JALON = 'phase_to_jalon', // Une phase doit être terminée avant qu'un jalon soit atteint
  JALON_TO_JALON = 'jalon_to_jalon', // Un jalon doit être atteint avant qu'un autre jalon soit atteint
}

export enum StatutDependance {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VIOLATED = 'violated', // La dépendance a été violée
  SATISFIED = 'satisfied', // La dépendance est satisfaite
}

export interface DependanceViolation {
  dependanceId: string;
  dependance: Dependance;
  violationType: TypeViolation;
  message: string;
  severity: SeveriteViolation;
  suggestedAction?: string;
  createdAt: Date;
}

export enum TypeViolation {
  DEADLINE_MISSED = 'deadline_missed',
  DEPENDENCY_CYCLE = 'dependency_cycle',
  RESOURCE_CONFLICT = 'resource_conflict',
  SCHEDULE_CONFLICT = 'schedule_conflict',
}

export enum SeveriteViolation {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Interface pour les calculs de chemin critique
export interface CheminCritique {
  phases: string[]; // IDs des phases dans le chemin critique
  jalons: string[]; // IDs des jalons dans le chemin critique
  dureeTotale: number; // Durée totale en jours
  margeTotale: number; // Marge totale en jours
  isCritique: boolean; // Si le chemin est critique
}

// Interface pour les calculs de marge
export interface MargeCalcul {
  phaseId: string;
  margeLibre: number; // Marge libre (sans affecter les suivantes)
  margeTotale: number; // Marge totale (sans affecter le projet)
  margeIndependante: number; // Marge indépendante
}

