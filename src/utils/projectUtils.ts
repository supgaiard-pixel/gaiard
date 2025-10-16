import { Projet, Phase, Creneau } from '@/types';

/**
 * Calcule les dates de début et fin d'un projet à partir de ses phases
 */
export function calculateProjectDates(phases: Phase[]): { dateDebut: Date; dateFin: Date } {
  if (phases.length === 0) {
    // Si aucune phase, utiliser la date actuelle
    const today = new Date();
    return {
      dateDebut: today,
      dateFin: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 jours par défaut
    };
  }

  // Trouver la date de début la plus ancienne (parmi tous les créneaux)
  const allDates = phases.flatMap(phase => 
    phase.creneaux && phase.creneaux.length > 0 
      ? phase.creneaux.map(creneau => creneau.dateDebut.getTime())
      : [phase.dateDebut.getTime()]
  );
  
  const dateDebut = new Date(Math.min(...allDates));
  
  // Trouver la date de fin la plus récente (parmi tous les créneaux)
  const allEndDates = phases.flatMap(phase => 
    phase.creneaux && phase.creneaux.length > 0 
      ? phase.creneaux.map(creneau => creneau.dateFin.getTime())
      : [phase.dateFin.getTime()]
  );
  
  const dateFin = new Date(Math.max(...allEndDates));

  return { dateDebut, dateFin };
}

/**
 * Met à jour les dates d'un projet en fonction de ses phases
 */
export function updateProjectDates(projet: Projet, phases: Phase[]): Projet {
  const { dateDebut, dateFin } = calculateProjectDates(phases);
  
  return {
    ...projet,
    dateDebut,
    dateFin,
    updatedAt: new Date()
  };
}

/**
 * Calcule la durée totale d'un projet en jours
 */
export function calculateProjectDuration(phases: Phase[]): number {
  if (phases.length === 0) return 0;
  
  const { dateDebut, dateFin } = calculateProjectDates(phases);
  return Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si un projet est en retard
 */
export function isProjectOverdue(projet: Projet, phases: Phase[]): boolean {
  const { dateFin } = calculateProjectDates(phases);
  const today = new Date();
  return dateFin < today && projet.statut !== 'termine';
}

/**
 * Calcule les dates d'une phase à partir de ses créneaux
 */
export function calculatePhaseDates(creneaux: Creneau[]): { dateDebut: Date; dateFin: Date; duree: number } {
  if (creneaux.length === 0) {
    const today = new Date();
    return {
      dateDebut: today,
      dateFin: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      duree: 7
    };
  }

  const dateDebut = new Date(Math.min(...creneaux.map(c => c.dateDebut.getTime())));
  const dateFin = new Date(Math.max(...creneaux.map(c => c.dateFin.getTime())));
  const duree = creneaux.reduce((total, creneau) => total + creneau.duree, 0);

  return { dateDebut, dateFin, duree };
}

/**
 * Crée un créneau par défaut pour une phase
 */
export function createDefaultCreneau(dateDebut: Date, dateFin: Date): Creneau {
  return {
    id: `creneau-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateDebut,
    dateFin,
    duree: Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
  };
}
