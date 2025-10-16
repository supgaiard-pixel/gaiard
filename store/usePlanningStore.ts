import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Agent, 
  Intervention, 
  Conge, 
  FiltresPlanning,
  CategorieIntervention,
  StatutIntervention,
  Projet,
  Phase,
  JalonProjet,
  Rapport,
  FiltresRapports,
  TypeRapport,
  PeriodeRapport,
  StatutRapport
} from '@/types';
import { agentService, interventionService, congeService, projetService, phaseService, jalonProjetService, rapportService } from '@/services/firebaseService';
import { pdfService } from '@/services/pdfService';
import { qrCodeService } from '@/services/qrCodeService';
import { updateProjectDates } from '@/utils/projectUtils';

interface PlanningState {
  // Données
  agents: Agent[];
  interventions: Intervention[];
  conges: Conge[];
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  rapports: Rapport[];
  
  // Filtres
  filtres: FiltresPlanning;
  filtresRapports: FiltresRapports;
  
  // État de l'interface
  selectedDate: Date;
  view: 'month' | 'week' | 'day';
  isModalOpen: boolean;
  selectedIntervention: Intervention | null;
  
  // Actions pour les agents
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  loadAgents: () => Promise<void>;
  saveAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAgentFirebase: (id: string, agent: Partial<Agent>) => Promise<void>;
  deleteAgentFirebase: (id: string) => Promise<void>;
  
  // Actions pour les interventions
  setInterventions: (interventions: Intervention[]) => void;
  addIntervention: (intervention: Intervention) => void;
  updateIntervention: (id: string, intervention: Partial<Intervention>) => void;
  deleteIntervention: (id: string) => void;
  moveIntervention: (id: string, newDate: Date, newAgentId?: string) => void;
  resizeIntervention: (id: string, newDateFin: Date) => void;
  loadInterventions: () => Promise<void>;
  saveIntervention: (intervention: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateInterventionFirebase: (id: string, intervention: Partial<Intervention>) => Promise<void>;
  deleteInterventionFirebase: (id: string) => Promise<void>;
  
  // Actions pour les congés
  setConges: (conges: Conge[]) => void;
  addConge: (conge: Conge) => void;
  updateConge: (id: string, conge: Partial<Conge>) => void;
  deleteConge: (id: string) => void;
  loadConges: () => Promise<void>;
  saveConge: (conge: Omit<Conge, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCongeFirebase: (id: string, conge: Partial<Conge>) => Promise<void>;
  deleteCongeFirebase: (id: string) => Promise<void>;
  
  // Actions pour les projets
  setProjets: (projets: Projet[]) => void;
  addProjet: (projet: Projet) => void;
  updateProjet: (id: string, projet: Partial<Projet>) => void;
  deleteProjet: (id: string) => void;
  loadProjets: () => Promise<void>;
  saveProjet: (projet: Omit<Projet, 'id' | 'createdAt' | 'updatedAt' | 'phases'>) => Promise<string>;
  updateProjetFirebase: (id: string, projet: Partial<Projet>) => Promise<void>;
  deleteProjetFirebase: (id: string) => Promise<void>;
  
  // Actions pour les phases
  setPhases: (phases: Phase[]) => void;
  addPhase: (phase: Phase) => void;
  updatePhase: (id: string, phase: Partial<Phase>) => void;
  deletePhase: (id: string) => void;
  loadPhases: (projetId: string) => Promise<void>;
  savePhase: (phase: Omit<Phase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePhaseFirebase: (id: string, phase: Partial<Phase>) => Promise<void>;
  deletePhaseFirebase: (id: string) => Promise<void>;
  
  // Actions pour les jalons
  setJalons: (jalons: JalonProjet[]) => void;
  addJalon: (jalon: JalonProjet) => void;
  updateJalon: (id: string, jalon: Partial<JalonProjet>) => void;
  deleteJalon: (id: string) => void;
  loadJalons: (projectId: string) => Promise<void>;
  saveJalon: (jalon: Omit<JalonProjet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateJalonFirebase: (id: string, jalon: Partial<JalonProjet>) => Promise<void>;
  deleteJalonFirebase: (id: string) => Promise<void>;
  
  // Actions pour les rapports
  setRapports: (rapports: Rapport[]) => void;
  addRapport: (rapport: Rapport) => void;
  updateRapport: (id: string, rapport: Partial<Rapport>) => void;
  deleteRapport: (id: string) => void;
  loadRapports: () => Promise<void>;
  loadRapportsByProjet: (projetId: string) => Promise<void>;
  saveRapport: (rapport: Omit<Rapport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRapportFirebase: (id: string, rapport: Partial<Rapport>) => Promise<void>;
  deleteRapportFirebase: (id: string) => Promise<void>;
  generateRapportPDF: (rapportId: string) => Promise<string>;
  generateQRCode: (rapportId: string) => Promise<string>;
  
  // Actions pour les filtres
  setFiltres: (filtres: Partial<FiltresPlanning>) => void;
  resetFiltres: () => void;
  setFiltresRapports: (filtres: Partial<FiltresRapports>) => void;
  resetFiltresRapports: () => void;
  
  // Actions pour l'interface
  setSelectedDate: (date: Date) => void;
  setView: (view: 'month' | 'week' | 'day') => void;
  setModalOpen: (open: boolean, intervention?: Intervention | null) => void;
  
  // Actions utilitaires
  getInterventionsFiltrees: () => Intervention[];
  getAgentsDisponibles: (date: Date) => Agent[];
  getInterventionsParAgent: (agentId: string) => Intervention[];
  getRapportsFiltres: () => Rapport[];
  getRapportsParProjet: (projetId: string) => Rapport[];
}

const initialState = {
  agents: [],
  interventions: [],
  conges: [],
  projets: [],
  phases: [],
  jalons: [],
  rapports: [],
  filtres: {
    categories: [],
    agents: [],
    statuts: [],
  },
  filtresRapports: {
    types: [],
    projets: [],
    agents: [],
    statuts: [],
    periodes: [],
  },
  selectedDate: new Date(),
  view: 'week' as const,
  isModalOpen: false,
  selectedIntervention: null,
};

export const usePlanningStore = create<PlanningState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Actions pour les agents
      setAgents: (agents) => set({ agents }),
      addAgent: (agent) => set((state) => ({ 
        agents: [...state.agents, agent] 
      })),
      updateAgent: (id, agent) => set((state) => ({
        agents: state.agents.map(a => a.id === id ? { ...a, ...agent } : a)
      })),
      deleteAgent: (id) => set((state) => ({
        agents: state.agents.filter(a => a.id !== id)
      })),
      
      // Actions Firebase pour les agents
      loadAgents: async () => {
        try {
          const agents = await agentService.getAll();
          set({ agents });
        } catch (error) {
          console.error('Erreur lors du chargement des agents:', error);
        }
      },
      saveAgent: async (agent) => {
        try {
          const id = await agentService.create(agent);
          const newAgent: Agent = {
            ...agent,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({ agents: [...state.agents, newAgent] }));
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de l\'agent:', error);
          throw error;
        }
      },
      updateAgentFirebase: async (id, agent) => {
        try {
          await agentService.update(id, agent);
          set((state) => ({
            agents: state.agents.map(a => a.id === id ? { ...a, ...agent, updatedAt: new Date() } : a)
          }));
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'agent:', error);
          throw error;
        }
      },
      deleteAgentFirebase: async (id) => {
        try {
          await agentService.delete(id);
          set((state) => ({
            agents: state.agents.filter(a => a.id !== id)
          }));
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'agent:', error);
          throw error;
        }
      },
      
      // Actions pour les interventions
      setInterventions: (interventions) => set({ interventions }),
      addIntervention: (intervention) => set((state) => ({
        interventions: [...state.interventions, intervention]
      })),
      updateIntervention: (id, intervention) => set((state) => ({
        interventions: state.interventions.map(i => 
          i.id === id ? { ...i, ...intervention } : i
        )
      })),
      deleteIntervention: (id) => set((state) => ({
        interventions: state.interventions.filter(i => i.id !== id)
      })),
      moveIntervention: (id, newDate, newAgentId) => set((state) => ({
        interventions: state.interventions.map(i => {
          if (i.id === id) {
            const duree = i.dateFin.getTime() - i.dateDebut.getTime();
            return {
              ...i,
              dateDebut: newDate,
              dateFin: new Date(newDate.getTime() + duree),
              agentId: newAgentId || i.agentId
            };
          }
          return i;
        })
      })),
      resizeIntervention: (id, newDateFin) => set((state) => ({
        interventions: state.interventions.map(i => 
          i.id === id ? { ...i, dateFin: newDateFin } : i
        )
      })),
      
      // Actions Firebase pour les interventions
      loadInterventions: async () => {
        try {
          const interventions = await interventionService.getAll();
          set({ interventions });
        } catch (error) {
          console.error('Erreur lors du chargement des interventions:', error);
        }
      },
      saveIntervention: async (intervention) => {
        try {
          const id = await interventionService.create(intervention);
          const newIntervention: Intervention = {
            ...intervention,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({ interventions: [...state.interventions, newIntervention] }));
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de l\'intervention:', error);
          throw error;
        }
      },
      updateInterventionFirebase: async (id, intervention) => {
        try {
          await interventionService.update(id, intervention);
          set((state) => ({
            interventions: state.interventions.map(i => 
              i.id === id ? { ...i, ...intervention, updatedAt: new Date() } : i
            )
          }));
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'intervention:', error);
          throw error;
        }
      },
      deleteInterventionFirebase: async (id) => {
        try {
          await interventionService.delete(id);
          set((state) => ({
            interventions: state.interventions.filter(i => i.id !== id)
          }));
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'intervention:', error);
          throw error;
        }
      },
      
      // Actions pour les congés
      setConges: (conges) => set({ conges }),
      addConge: (conge) => set((state) => ({
        conges: [...state.conges, conge]
      })),
      updateConge: (id, conge) => set((state) => ({
        conges: state.conges.map(c => c.id === id ? { ...c, ...conge } : c)
      })),
      deleteConge: (id) => set((state) => ({
        conges: state.conges.filter(c => c.id !== id)
      })),
      
      // Actions Firebase pour les congés
      loadConges: async () => {
        try {
          const conges = await congeService.getAll();
          set({ conges });
        } catch (error) {
          console.error('Erreur lors du chargement des congés:', error);
        }
      },
      saveConge: async (conge) => {
        try {
          const id = await congeService.create(conge);
          const newConge: Conge = {
            ...conge,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({ conges: [...state.conges, newConge] }));
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du congé:', error);
          throw error;
        }
      },
      updateCongeFirebase: async (id, conge) => {
        try {
          await congeService.update(id, conge);
          set((state) => ({
            conges: state.conges.map(c => c.id === id ? { ...c, ...conge, updatedAt: new Date() } : c)
          }));
        } catch (error) {
          console.error('Erreur lors de la mise à jour du congé:', error);
          throw error;
        }
      },
      deleteCongeFirebase: async (id) => {
        try {
          await congeService.delete(id);
          set((state) => ({
            conges: state.conges.filter(c => c.id !== id)
          }));
        } catch (error) {
          console.error('Erreur lors de la suppression du congé:', error);
          throw error;
        }
      },
      
      // Actions pour les filtres
      setFiltres: (filtres) => set((state) => ({
        filtres: { ...state.filtres, ...filtres }
      })),
      resetFiltres: () => set({ filtres: initialState.filtres }),
      setFiltresRapports: (filtres) => set((state) => ({
        filtresRapports: { ...state.filtresRapports, ...filtres }
      })),
      resetFiltresRapports: () => set({ filtresRapports: initialState.filtresRapports }),
      
      // Actions pour l'interface
      setSelectedDate: (date) => set({ selectedDate: date }),
      setView: (view) => set({ view }),
      setModalOpen: (open, intervention = null) => set({ 
        isModalOpen: open, 
        selectedIntervention: intervention 
      }),
      
      // Actions utilitaires
      getInterventionsFiltrees: () => {
        const { interventions, filtres } = get();
        return interventions.filter(intervention => {
          // Filtre par catégorie
          if (filtres.categories.length > 0 && 
              !filtres.categories.includes(intervention.categorie)) {
            return false;
          }
          
          // Filtre par agent
          if (filtres.agents.length > 0 && 
              !filtres.agents.includes(intervention.agentId)) {
            return false;
          }
          
          // Filtre par statut
          if (filtres.statuts.length > 0 && 
              !filtres.statuts.includes(intervention.statut)) {
            return false;
          }
          
          // Filtre par date
          if (filtres.dateDebut && intervention.dateDebut < filtres.dateDebut) {
            return false;
          }
          
          if (filtres.dateFin && intervention.dateFin > filtres.dateFin) {
            return false;
          }
          
          return true;
        });
      },
      
      getAgentsDisponibles: (date) => {
        const { agents, conges } = get();
        return agents.filter(agent => {
          // Vérifier si l'agent est actif
          if (!agent.actif) return false;
          
          // Vérifier s'il n'est pas en congé
          const estEnConge = conges.some(conge => 
            conge.agentId === agent.id &&
            conge.statut === 'valide' &&
            date >= conge.dateDebut &&
            date <= conge.dateFin
          );
          
          return !estEnConge;
        });
      },
      
      getInterventionsParAgent: (agentId) => {
        const { interventions } = get();
        return interventions.filter(i => i.agentId === agentId);
      },
      
      getRapportsFiltres: () => {
        const { rapports, filtresRapports } = get();
        return rapports.filter(rapport => {
          // Filtre par type
          if (filtresRapports.types.length > 0 && 
              !filtresRapports.types.includes(rapport.type)) {
            return false;
          }
          
          // Filtre par projet
          if (filtresRapports.projets.length > 0 && 
              !filtresRapports.projets.includes(rapport.projetId)) {
            return false;
          }
          
          // Filtre par agent
          if (filtresRapports.agents.length > 0 && 
              !rapport.agentsIds.some(agentId => filtresRapports.agents.includes(agentId))) {
            return false;
          }
          
          // Filtre par statut
          if (filtresRapports.statuts.length > 0 && 
              !filtresRapports.statuts.includes(rapport.statut)) {
            return false;
          }
          
          // Filtre par période
          if (filtresRapports.periodes.length > 0 && 
              !filtresRapports.periodes.includes(rapport.periode)) {
            return false;
          }
          
          // Filtre par date
          if (filtresRapports.dateDebut && rapport.dateRapport < filtresRapports.dateDebut) {
            return false;
          }
          
          if (filtresRapports.dateFin && rapport.dateRapport > filtresRapports.dateFin) {
            return false;
          }
          
          // Filtre par type externe/interne
          if (filtresRapports.isExterne !== undefined && 
              rapport.isExterne !== filtresRapports.isExterne) {
            return false;
          }
          
          return true;
        });
      },
      
      getRapportsParProjet: (projetId) => {
        const { rapports } = get();
        return rapports.filter(r => r.projetId === projetId);
      },

      // Actions pour les projets
      setProjets: (projets) => set({ projets }),
      addProjet: (projet) => set(state => ({ projets: [...state.projets, projet] })),
      updateProjet: (id, projet) => set(state => ({
        projets: state.projets.map(p => p.id === id ? { ...p, ...projet } : p)
      })),
      deleteProjet: (id) => set(state => ({
        projets: state.projets.filter(p => p.id !== id)
      })),
      loadProjets: async () => {
        try {
          const projets = await projetService.getAll();
          set({ projets });
        } catch (error) {
          console.error('Erreur lors du chargement des projets:', error);
        }
      },
      saveProjet: async (projet) => {
        try {
          const id = await projetService.create(projet);
          const nouveauProjet = { ...projet, id, createdAt: new Date(), updatedAt: new Date(), phases: [] };
          set(state => ({ projets: [...state.projets, nouveauProjet] }));
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du projet:', error);
          throw error;
        }
      },
      updateProjetFirebase: async (id, projet) => {
        try {
          await projetService.update(id, projet);
          set(state => ({
            projets: state.projets.map(p => p.id === id ? { ...p, ...projet, updatedAt: new Date() } : p)
          }));
        } catch (error) {
          console.error('Erreur lors de la mise à jour du projet:', error);
          throw error;
        }
      },
      deleteProjetFirebase: async (id) => {
        try {
          await projetService.delete(id);
          set(state => ({ projets: state.projets.filter(p => p.id !== id) }));
        } catch (error) {
          console.error('Erreur lors de la suppression du projet:', error);
          throw error;
        }
      },

      // Actions pour les phases
      setPhases: (phases) => set({ phases }),
      addPhase: (phase) => set(state => ({ phases: [...state.phases, phase] })),
      updatePhase: (id, phase) => set(state => ({
        phases: state.phases.map(p => p.id === id ? { ...p, ...phase } : p)
      })),
      deletePhase: (id) => set(state => ({
        phases: state.phases.filter(p => p.id !== id)
      })),
      loadPhases: async (projetId) => {
        try {
          const phases = await phaseService.getByProjet(projetId);
          set(state => ({
            phases: [...state.phases.filter(p => p.projectId !== projetId), ...phases]
          }));
        } catch (error) {
          console.error('Erreur lors du chargement des phases:', error);
        }
      },
      savePhase: async (phase) => {
        try {
          const id = await phaseService.create(phase);
          const nouvellePhase = { ...phase, id, createdAt: new Date(), updatedAt: new Date() };
          set(state => {
            const newPhases = [...state.phases, nouvellePhase];
            const projetPhases = newPhases.filter(p => p.projectId === phase.projectId);
            const projet = state.projets.find(p => p.id === phase.projectId);
            
            if (projet) {
              const updatedProjet = updateProjectDates(projet, projetPhases);
              return {
                phases: newPhases,
                projets: state.projets.map(p => p.id === phase.projectId ? updatedProjet : p)
              };
            }
            
            return { phases: newPhases };
          });
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la phase:', error);
          throw error;
        }
      },
      updatePhaseFirebase: async (id, phase) => {
        try {
          await phaseService.update(id, phase);
          set(state => {
            const updatedPhases = state.phases.map(p => p.id === id ? { ...p, ...phase, updatedAt: new Date() } : p);
            const updatedPhase = updatedPhases.find(p => p.id === id);
            
            if (updatedPhase) {
              const projetPhases = updatedPhases.filter(p => p.projectId === updatedPhase.projectId);
              const projet = state.projets.find(p => p.id === updatedPhase.projectId);
              
              if (projet) {
                const updatedProjet = updateProjectDates(projet, projetPhases);
                return {
                  phases: updatedPhases,
                  projets: state.projets.map(p => p.id === updatedPhase.projectId ? updatedProjet : p)
                };
              }
            }
            
            return { phases: updatedPhases };
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la phase:', error);
          throw error;
        }
      },
      deletePhaseFirebase: async (id) => {
        try {
          await phaseService.delete(id);
          set(state => {
            const phaseToDelete = state.phases.find(p => p.id === id);
            const updatedPhases = state.phases.filter(p => p.id !== id);
            
            if (phaseToDelete) {
              const projetPhases = updatedPhases.filter(p => p.projectId === phaseToDelete.projectId);
              const projet = state.projets.find(p => p.id === phaseToDelete.projectId);
              
              if (projet) {
                const updatedProjet = updateProjectDates(projet, projetPhases);
                return {
                  phases: updatedPhases,
                  projets: state.projets.map(p => p.id === phaseToDelete.projectId ? updatedProjet : p)
                };
              }
            }
            
            return { phases: updatedPhases };
          });
        } catch (error) {
          console.error('Erreur lors de la suppression de la phase:', error);
          throw error;
        }
      },

      // Actions pour les jalons
      setJalons: (jalons) => set({ jalons }),
      addJalon: (jalon) => set(state => ({ jalons: [...state.jalons, jalon] })),
      updateJalon: (id, jalon) => set(state => ({
        jalons: state.jalons.map(j => j.id === id ? { ...j, ...jalon } : j)
      })),
      deleteJalon: (id) => set(state => ({
        jalons: state.jalons.filter(j => j.id !== id)
      })),
      loadJalons: async (projectId) => {
        try {
          const jalons = await jalonProjetService.getByProjet(projectId);
          set(state => ({
            jalons: [...state.jalons.filter(j => j.projectId !== projectId), ...jalons]
          }));
        } catch (error) {
          console.error('Erreur lors du chargement des jalons:', error);
        }
      },
      saveJalon: async (jalon) => {
        try {
          const id = await jalonProjetService.create(jalon);
          const nouveauJalon = { ...jalon, id, createdAt: new Date(), updatedAt: new Date() };
          set(state => ({ jalons: [...state.jalons, nouveauJalon] }));
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du jalon:', error);
          throw error;
        }
      },
      updateJalonFirebase: async (id, jalon) => {
        try {
          await jalonProjetService.update(id, jalon);
          set(state => ({
            jalons: state.jalons.map(j => j.id === id ? { ...j, ...jalon, updatedAt: new Date() } : j)
          }));
        } catch (error) {
          console.error('Erreur lors de la mise à jour du jalon:', error);
          throw error;
        }
      },
      deleteJalonFirebase: async (id) => {
        try {
          await jalonProjetService.delete(id);
          set(state => ({ jalons: state.jalons.filter(j => j.id !== id) }));
        } catch (error) {
          console.error('Erreur lors de la suppression du jalon:', error);
          throw error;
        }
      },

      // Actions pour les rapports
      setRapports: (rapports) => set({ rapports }),
      addRapport: (rapport) => set(state => ({ rapports: [...state.rapports, rapport] })),
      updateRapport: (id, rapport) => set(state => ({
        rapports: state.rapports.map(r => r.id === id ? { ...r, ...rapport } : r)
      })),
      deleteRapport: (id) => set(state => ({
        rapports: state.rapports.filter(r => r.id !== id)
      })),
      loadRapports: async () => {
        try {
          const rapports = await rapportService.getAll();
          set({ rapports });
        } catch (error) {
          console.error('Erreur lors du chargement des rapports:', error);
        }
      },
      loadRapportsByProjet: async (projetId) => {
        try {
          const rapports = await rapportService.getByProjet(projetId);
          set(state => ({
            rapports: [...state.rapports.filter(r => r.projetId !== projetId), ...rapports]
          }));
        } catch (error) {
          console.error('Erreur lors du chargement des rapports du projet:', error);
        }
      },
      saveRapport: async (rapport) => {
        try {
          const id = await rapportService.create(rapport);
          const nouveauRapport = { ...rapport, id, createdAt: new Date(), updatedAt: new Date() };
          set(state => ({ rapports: [...state.rapports, nouveauRapport] }));
          return id;
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du rapport:', error);
          throw error;
        }
      },
      updateRapportFirebase: async (id, rapport) => {
        try {
          await rapportService.update(id, rapport);
          set(state => ({
            rapports: state.rapports.map(r => r.id === id ? { ...r, ...rapport, updatedAt: new Date() } : r)
          }));
        } catch (error) {
          console.error('Erreur lors de la mise à jour du rapport:', error);
          throw error;
        }
      },
      deleteRapportFirebase: async (id) => {
        try {
          await rapportService.delete(id);
          set(state => ({ rapports: state.rapports.filter(r => r.id !== id) }));
        } catch (error) {
          console.error('Erreur lors de la suppression du rapport:', error);
          throw error;
        }
      },
      generateRapportPDF: async (rapportId) => {
        try {
          const rapport = get().rapports.find(r => r.id === rapportId);
          if (!rapport) throw new Error('Rapport non trouvé');
          
          // Récupérer les agents et le projet associés
          const agents = get().agents.filter(a => rapport.agentsIds.includes(a.id));
          const projet = get().projets.find(p => p.id === rapport.projetId);
          
          if (!projet) throw new Error('Projet non trouvé');
          
          // Générer le PDF
          const pdfBlob = await pdfService.generateRapportPDF(rapport, agents, projet);
          
          // Nettoyer les noms pour l'arborescence
          const nomChantierNettoye = projet.nom
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();
          
          const typeRapportNettoye = rapport.type
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();
          
          // Uploader le PDF via l'API locale
          const formData = new FormData();
          formData.append('pdf', pdfBlob, 'rapport.pdf');
          formData.append('rapportId', rapportId);
          formData.append('nomChantier', nomChantierNettoye);
          formData.append('typeRapport', typeRapportNettoye);
          formData.append('dateRapport', rapport.dateRapport.toISOString());
          
          const response = await fetch('/api/rapports/upload-pdf', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors de l\'upload du PDF');
          }
          
          const result = await response.json();
          const pdfUrl = result.pdfUrl;
          
          // Mettre à jour le rapport avec l'URL du PDF
          await get().updateRapportFirebase(rapportId, { pdfUrl });
          
          return pdfUrl;
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          throw error;
        }
      },
      generateQRCode: async (rapportId) => {
        try {
          const rapport = get().rapports.find(r => r.id === rapportId);
          if (!rapport) throw new Error('Rapport non trouvé');
          
          // Générer le QR code
          const qrCodeUrl = await qrCodeService.generateQRCode(rapportId);
          
          // Mettre à jour le rapport avec l'URL du QR code
          await get().updateRapportFirebase(rapportId, { qrCode: qrCodeUrl });
          
          return qrCodeUrl;
        } catch (error) {
          console.error('Erreur lors de la génération du QR code:', error);
          throw error;
        }
      },
    }),
    {
      name: 'planning-store',
    }
  )
);
