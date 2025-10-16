import { Dependance, TypeDependance, StatutDependance, DependanceViolation, TypeViolation, SeveriteViolation, CheminCritique, MargeCalcul } from '@/types/dependencies';
import { Phase, JalonProjet, Projet } from '@/types';

export class DependenciesService {
  // Créer une nouvelle dépendance
  async createDependance(dependance: Omit<Dependance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dependance> {
    const newDependance: Dependance = {
      ...dependance,
      id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Sauvegarder en base de données
    return newDependance;
  }

  // Vérifier les violations de dépendances
  async checkDependanceViolations(
    dependances: Dependance[],
    phases: Phase[],
    jalons: JalonProjet[]
  ): Promise<DependanceViolation[]> {
    const violations: DependanceViolation[] = [];

    for (const dependance of dependances) {
      if (dependance.statut === StatutDependance.INACTIVE) continue;

      const violation = this.checkSingleDependance(dependance, phases, jalons);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  private checkSingleDependance(
    dependance: Dependance,
    phases: Phase[],
    jalons: JalonProjet[]
  ): DependanceViolation | null {
    const sourcePhase = phases.find(p => p.id === dependance.sourceId);
    const targetPhase = phases.find(p => p.id === dependance.targetId);
    const sourceJalon = jalons.find(j => j.id === dependance.sourceId);
    const targetJalon = jalons.find(j => j.id === dependance.targetId);

    switch (dependance.type) {
      case TypeDependance.FIN_TO_DEBUT:
        if (sourcePhase && targetPhase) {
          if (sourcePhase.dateFin > targetPhase.dateDebut) {
            return {
              dependanceId: dependance.id,
              dependance,
              violationType: TypeViolation.SCHEDULE_CONFLICT,
              message: `La phase "${sourcePhase.nom}" se termine après le début de "${targetPhase.nom}"`,
              severity: SeveriteViolation.HIGH,
              suggestedAction: 'Ajuster les dates ou ajouter un délai',
              createdAt: new Date(),
            };
          }
        }
        break;

      case TypeDependance.JALON_TO_PHASE:
        if (sourceJalon && targetPhase) {
          if (sourceJalon.dateEcheance > targetPhase.dateDebut) {
            return {
              dependanceId: dependance.id,
              dependance,
              violationType: TypeViolation.DEADLINE_MISSED,
              message: `Le jalon "${sourceJalon.titre}" est prévu après le début de la phase "${targetPhase.nom}"`,
              severity: SeveriteViolation.MEDIUM,
              suggestedAction: 'Ajuster la date du jalon ou de la phase',
              createdAt: new Date(),
            };
          }
        }
        break;

      case TypeDependance.PHASE_TO_JALON:
        if (sourcePhase && targetJalon) {
          if (sourcePhase.dateFin > targetJalon.dateEcheance) {
            return {
              dependanceId: dependance.id,
              dependance,
              violationType: TypeViolation.DEADLINE_MISSED,
              message: `La phase "${sourcePhase.nom}" se termine après l'échéance du jalon "${targetJalon.titre}"`,
              severity: SeveriteViolation.HIGH,
              suggestedAction: 'Accélérer la phase ou reporter le jalon',
              createdAt: new Date(),
            };
          }
        }
        break;

      case TypeDependance.JALON_TO_JALON:
        if (sourceJalon && targetJalon) {
          if (sourceJalon.dateEcheance > targetJalon.dateEcheance) {
            return {
              dependanceId: dependance.id,
              dependance,
              violationType: TypeViolation.SCHEDULE_CONFLICT,
              message: `Le jalon "${sourceJalon.titre}" est prévu après "${targetJalon.titre}"`,
              severity: SeveriteViolation.MEDIUM,
              suggestedAction: 'Réorganiser les jalons',
              createdAt: new Date(),
            };
          }
        }
        break;
    }

    return null;
  }

  // Calculer le chemin critique
  async calculateCheminCritique(
    projet: Projet,
    phases: Phase[],
    jalons: JalonProjet[],
    dependances: Dependance[]
  ): Promise<CheminCritique> {
    const projetPhases = phases.filter(p => p.projectId === projet.id);
    const projetJalons = jalons.filter(j => j.projectId === projet.id);

    // Créer un graphe des dépendances
    const graph = this.buildDependencyGraph(projetPhases, projetJalons, dependances);
    
    // Calculer les dates au plus tôt et au plus tard
    const earlyDates = this.calculateEarlyDates(graph, projetPhases, projetJalons);
    const lateDates = this.calculateLateDates(graph, projetPhases, projetJalons, earlyDates);

    // Identifier le chemin critique
    const criticalPath = this.identifyCriticalPath(projetPhases, projetJalons, earlyDates, lateDates);

    return {
      phases: criticalPath.phases,
      jalons: criticalPath.jalons,
      dureeTotale: criticalPath.duration,
      margeTotale: criticalPath.margin,
      isCritique: criticalPath.margin === 0,
    };
  }

  private buildDependencyGraph(
    phases: Phase[],
    jalons: JalonProjet[],
    dependances: Dependance[]
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // Initialiser le graphe
    [...phases, ...jalons].forEach(item => {
      graph.set(item.id, []);
    });

    // Ajouter les dépendances
    dependances.forEach(dep => {
      if (dep.statut === StatutDependance.ACTIVE) {
        const dependencies = graph.get(dep.targetId) || [];
        dependencies.push(dep.sourceId);
        graph.set(dep.targetId, dependencies);
      }
    });

    return graph;
  }

  private calculateEarlyDates(
    graph: Map<string, string[]>,
    phases: Phase[],
    jalons: JalonProjet[]
  ): Map<string, number> {
    const earlyDates = new Map<string, number>();
    const visited = new Set<string>();

    const calculate = (id: string): number => {
      if (visited.has(id)) return earlyDates.get(id) || 0;
      visited.add(id);

      const dependencies = graph.get(id) || [];
      let maxDependencyDate = 0;

      dependencies.forEach(depId => {
        const depDate = calculate(depId);
        const item = [...phases, ...jalons].find(item => item.id === depId);
        if (item) {
          const itemEndDate = 'dateFin' in item ? item.dateFin.getTime() : item.dateEcheance.getTime();
          maxDependencyDate = Math.max(maxDependencyDate, depDate + itemEndDate);
        }
      });

      earlyDates.set(id, maxDependencyDate);
      return maxDependencyDate;
    };

    [...phases, ...jalons].forEach(item => {
      calculate(item.id);
    });

    return earlyDates;
  }

  private calculateLateDates(
    graph: Map<string, string[]>,
    phases: Phase[],
    jalons: JalonProjet[],
    earlyDates: Map<string, number>
  ): Map<string, number> {
    const lateDates = new Map<string, number>();
    
    // Calculer la date de fin du projet
    const projectEndDate = Math.max(...Array.from(earlyDates.values()));
    
    // Calculer les dates au plus tard (rétropropagation)
    const calculateLate = (id: string): number => {
      if (lateDates.has(id)) return lateDates.get(id)!;

      const item = [...phases, ...jalons].find(item => item.id === id);
      if (!item) return projectEndDate;

      const itemDuration = 'dateFin' in item 
        ? item.dateFin.getTime() - item.dateDebut.getTime()
        : 0;

      // Trouver les éléments qui dépendent de cet élément
      const dependents = Array.from(graph.entries())
        .filter(([_, deps]) => deps.includes(id))
        .map(([depId, _]) => depId);

      if (dependents.length === 0) {
        // Pas de dépendants, utiliser la date de fin du projet
        lateDates.set(id, projectEndDate - itemDuration);
        return lateDates.get(id)!;
      }

      // Calculer la date au plus tard basée sur les dépendants
      const dependentLateDates = dependents.map(depId => calculateLate(depId));
      const minDependentDate = Math.min(...dependentLateDates);
      
      lateDates.set(id, minDependentDate - itemDuration);
      return lateDates.get(id)!;
    };

    [...phases, ...jalons].forEach(item => {
      calculateLate(item.id);
    });

    return lateDates;
  }

  private identifyCriticalPath(
    phases: Phase[],
    jalons: JalonProjet[],
    earlyDates: Map<string, number>,
    lateDates: Map<string, number>
  ): { phases: string[], jalons: string[], duration: number, margin: number } {
    const criticalPhases: string[] = [];
    const criticalJalons: string[] = [];
    let totalDuration = 0;
    let totalMargin = 0;

    [...phases, ...jalons].forEach(item => {
      const earlyDate = earlyDates.get(item.id) || 0;
      const lateDate = lateDates.get(item.id) || 0;
      const margin = lateDate - earlyDate;

      if (margin === 0) {
        if ('dateFin' in item) {
          criticalPhases.push(item.id);
        } else {
          criticalJalons.push(item.id);
        }
      }

      totalDuration = Math.max(totalDuration, earlyDate);
      totalMargin += margin;
    });

    return {
      phases: criticalPhases,
      jalons: criticalJalons,
      duration: totalDuration,
      margin: totalMargin,
    };
  }

  // Calculer les marges pour chaque phase
  async calculateMarges(
    phases: Phase[],
    jalons: JalonProjet[],
    dependances: Dependance[]
  ): Promise<MargeCalcul[]> {
    const graph = this.buildDependencyGraph(phases, jalons, dependances);
    const earlyDates = this.calculateEarlyDates(graph, phases, jalons);
    const lateDates = this.calculateLateDates(graph, phases, jalons, earlyDates);

    return phases.map(phase => {
      const earlyDate = earlyDates.get(phase.id) || 0;
      const lateDate = lateDates.get(phase.id) || 0;
      const margeTotale = lateDate - earlyDate;

      // Calculer la marge libre (sans affecter les phases suivantes)
      const dependants = Array.from(graph.entries())
        .filter(([_, deps]) => deps.includes(phase.id))
        .map(([depId, _]) => depId);

      let margeLibre = margeTotale;
      if (dependants.length > 0) {
        const minDependentEarly = Math.min(...dependants.map(depId => earlyDates.get(depId) || 0));
        margeLibre = Math.min(margeTotale, minDependentEarly - (earlyDate + (phase.dateFin.getTime() - phase.dateDebut.getTime())));
      }

      return {
        phaseId: phase.id,
        margeLibre: Math.max(0, margeLibre),
        margeTotale: Math.max(0, margeTotale),
        margeIndependante: Math.max(0, margeTotale - margeLibre),
      };
    });
  }
}

export const dependenciesService = new DependenciesService();
