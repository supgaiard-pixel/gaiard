import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { Agent, Intervention, Conge, Projet, Phase, JalonProjet, Rapport } from '@/types';
import { getDb } from '@/lib/firebase';

// Service pour les agents
export const agentService = {
  // Récupérer tous les agents
  async getAll(): Promise<Agent[]> {
    const db = await getDb();
    const querySnapshot = await getDocs(collection(db, 'agents'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Agent[];
  },

  // Récupérer un agent par ID
  async getById(id: string): Promise<Agent | null> {
    const db = await getDb();
    const docRef = doc(db, 'agents', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Agent;
    }
    return null;
  },

  // Créer un agent
  async create(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'agents'), {
      ...agent,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour un agent
  async update(id: string, agent: Partial<Agent>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'agents', id);
    await updateDoc(docRef, {
      ...agent,
      updatedAt: Timestamp.now(),
    });
  },

  // Supprimer un agent
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'agents', id);
    await deleteDoc(docRef);
  },
};

// Service pour les interventions
export const interventionService = {
  // Récupérer toutes les interventions
  async getAll(): Promise<Intervention[]> {
    const db = await getDb();
    const querySnapshot = await getDocs(collection(db, 'interventions'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Intervention[];
  },

  // Récupérer les interventions par agent
  async getByAgent(agentId: string): Promise<Intervention[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'interventions'),
      where('agentId', '==', agentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Intervention[];
  },

  // Récupérer les interventions par période
  async getByDateRange(startDate: Date, endDate: Date): Promise<Intervention[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'interventions'),
      where('dateDebut', '>=', startDate),
      where('dateDebut', '<=', endDate),
      orderBy('dateDebut')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Intervention[];
  },

  // Créer une intervention
  async create(intervention: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'interventions'), {
      ...intervention,
      dateDebut: Timestamp.fromDate(intervention.dateDebut),
      dateFin: Timestamp.fromDate(intervention.dateFin),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour une intervention
  async update(id: string, intervention: Partial<Intervention>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'interventions', id);
    const updateData: any = {
      ...intervention,
      updatedAt: Timestamp.now(),
    };
    
    if (intervention.dateDebut) {
      updateData.dateDebut = Timestamp.fromDate(intervention.dateDebut);
    }
    if (intervention.dateFin) {
      updateData.dateFin = Timestamp.fromDate(intervention.dateFin);
    }
    
    await updateDoc(docRef, updateData);
  },

  // Supprimer une intervention
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'interventions', id);
    await deleteDoc(docRef);
  },
};

// Service pour les congés
export const congeService = {
  // Récupérer tous les congés
  async getAll(): Promise<Conge[]> {
    const db = await getDb();
    const querySnapshot = await getDocs(collection(db, 'conges'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Conge[];
  },

  // Récupérer les congés par agent
  async getByAgent(agentId: string): Promise<Conge[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'conges'),
      where('agentId', '==', agentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Conge[];
  },

  // Créer un congé
  async create(conge: Omit<Conge, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'conges'), {
      ...conge,
      dateDebut: Timestamp.fromDate(conge.dateDebut),
      dateFin: Timestamp.fromDate(conge.dateFin),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour un congé
  async update(id: string, conge: Partial<Conge>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'conges', id);
    const updateData: any = {
      ...conge,
      updatedAt: Timestamp.now(),
    };
    
    if (conge.dateDebut) {
      updateData.dateDebut = Timestamp.fromDate(conge.dateDebut);
    }
    if (conge.dateFin) {
      updateData.dateFin = Timestamp.fromDate(conge.dateFin);
    }
    
    await updateDoc(docRef, updateData);
  },

  // Supprimer un congé
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'conges', id);
    await deleteDoc(docRef);
  },
};

// Service pour les projets
export const projetService = {
  // Récupérer tous les projets
  async getAll(): Promise<Projet[]> {
    const db = await getDb();
    const querySnapshot = await getDocs(collection(db, 'projets'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      phases: [] // Les phases seront chargées séparément
    } as unknown as Projet));
  },

  // Récupérer un projet par ID
  async getById(id: string): Promise<Projet | null> {
    const db = await getDb();
    const docRef = doc(db, 'projets', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        dateDebut: docSnap.data().dateDebut?.toDate() || new Date(),
        dateFin: docSnap.data().dateFin?.toDate() || new Date(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        phases: [] // Les phases seront chargées séparément
      } as unknown as Projet;
    }
    return null;
  },

  // Créer un projet
  async create(projet: Omit<Projet, 'id' | 'createdAt' | 'updatedAt' | 'phases'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'projets'), {
      ...projet,
      dateDebut: Timestamp.fromDate(projet.dateDebut),
      dateFin: Timestamp.fromDate(projet.dateFin),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour un projet
  async update(id: string, projet: Partial<Projet>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'projets', id);
    const updateData: any = {
      ...projet,
      updatedAt: Timestamp.now(),
    };
    
    if (projet.dateDebut) {
      updateData.dateDebut = Timestamp.fromDate(projet.dateDebut);
    }
    if (projet.dateFin) {
      updateData.dateFin = Timestamp.fromDate(projet.dateFin);
    }
    
    await updateDoc(docRef, updateData);
  },

  // Supprimer un projet
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'projets', id);
    await deleteDoc(docRef);
  },
};

// Service pour les phases
export const phaseService = {
  // Récupérer toutes les phases d'un projet
  async getByProjet(projetId: string): Promise<Phase[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'phases'),
      where('projectId', '==', projetId),
      orderBy('ordre')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDebut: doc.data().dateDebut?.toDate() || new Date(),
      dateFin: doc.data().dateFin?.toDate() || new Date(),
      creneaux: doc.data().creneaux?.map((creneau: any) => ({
        ...creneau,
        dateDebut: creneau.dateDebut?.toDate() || new Date(),
        dateFin: creneau.dateFin?.toDate() || new Date(),
      })) || [],
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Phase[];
  },

  // Récupérer une phase par ID
  async getById(id: string): Promise<Phase | null> {
    const db = await getDb();
    const docRef = doc(db, 'phases', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        dateDebut: docSnap.data().dateDebut?.toDate() || new Date(),
        dateFin: docSnap.data().dateFin?.toDate() || new Date(),
        creneaux: docSnap.data().creneaux?.map((creneau: any) => ({
          ...creneau,
          dateDebut: creneau.dateDebut?.toDate() || new Date(),
          dateFin: creneau.dateFin?.toDate() || new Date(),
        })) || [],
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Phase;
    }
    return null;
  },

  // Créer une phase
  async create(phase: Omit<Phase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'phases'), {
      ...phase,
      dateDebut: Timestamp.fromDate(phase.dateDebut),
      dateFin: Timestamp.fromDate(phase.dateFin),
      creneaux: phase.creneaux?.map(creneau => ({
        ...creneau,
        dateDebut: Timestamp.fromDate(creneau.dateDebut),
        dateFin: Timestamp.fromDate(creneau.dateFin),
      })) || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour une phase
  async update(id: string, phase: Partial<Phase>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'phases', id);
    const updateData: any = {
      ...phase,
      updatedAt: Timestamp.now(),
    };
    
    if (phase.dateDebut) {
      updateData.dateDebut = Timestamp.fromDate(phase.dateDebut);
    }
    if (phase.dateFin) {
      updateData.dateFin = Timestamp.fromDate(phase.dateFin);
    }
    if (phase.creneaux) {
      updateData.creneaux = phase.creneaux.map(creneau => ({
        ...creneau,
        dateDebut: Timestamp.fromDate(creneau.dateDebut),
        dateFin: Timestamp.fromDate(creneau.dateFin),
      }));
    }
    
    await updateDoc(docRef, updateData);
  },

  // Supprimer une phase
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'phases', id);
    await deleteDoc(docRef);
  },
};

// Service pour les jalons de projet
export const jalonProjetService = {
  // Récupérer tous les jalons d'un projet
  async getByProjet(projectId: string): Promise<JalonProjet[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'jalonsProjet'),
      where('projectId', '==', projectId),
      orderBy('ordre')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateEcheance: doc.data().dateEcheance?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as JalonProjet[];
  },

  // Récupérer un jalon par ID
  async getById(id: string): Promise<JalonProjet | null> {
    const db = await getDb();
    const docRef = doc(db, 'jalonsProjet', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        dateEcheance: docSnap.data().dateEcheance?.toDate() || new Date(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as JalonProjet;
    }
    return null;
  },

  // Créer un jalon
  async create(jalon: Omit<JalonProjet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'jalonsProjet'), {
      ...jalon,
      dateEcheance: Timestamp.fromDate(jalon.dateEcheance),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour un jalon
  async update(id: string, jalon: Partial<JalonProjet>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'jalonsProjet', id);
    const updateData: any = {
      ...jalon,
      updatedAt: Timestamp.now(),
    };
    
    if (jalon.dateEcheance) {
      updateData.dateEcheance = Timestamp.fromDate(jalon.dateEcheance);
    }
    
    await updateDoc(docRef, updateData);
  },

  // Supprimer un jalon
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'jalonsProjet', id);
    await deleteDoc(docRef);
  },
};

// Service pour les rapports
export const rapportService = {
  // Récupérer tous les rapports
  async getAll(): Promise<Rapport[]> {
    const db = await getDb();
    const querySnapshot = await getDocs(collection(db, 'rapports'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateRapport: doc.data().dateRapport?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Rapport[];
  },

  // Récupérer les rapports par projet
  async getByProjet(projetId: string): Promise<Rapport[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'rapports'),
      where('projetId', '==', projetId),
      orderBy('dateRapport', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateRapport: doc.data().dateRapport?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Rapport[];
  },

  // Récupérer les rapports par agent
  async getByAgent(agentId: string): Promise<Rapport[]> {
    const db = await getDb();
    const q = query(
      collection(db, 'rapports'),
      where('agentsIds', 'array-contains', agentId),
      orderBy('dateRapport', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateRapport: doc.data().dateRapport?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Rapport[];
  },

  // Récupérer les rapports externes par token
  async getByToken(token: string): Promise<Rapport | null> {
    const db = await getDb();
    const q = query(
      collection(db, 'rapports'),
      where('tokenAcces', '==', token),
      where('isExterne', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      dateRapport: doc.data().dateRapport?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Rapport;
  },

  // Récupérer un rapport par ID
  async getById(id: string): Promise<Rapport | null> {
    const db = await getDb();
    const docRef = doc(db, 'rapports', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        dateRapport: docSnap.data().dateRapport?.toDate() || new Date(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Rapport;
    }
    return null;
  },

  // Créer un rapport
  async create(rapport: Omit<Rapport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const docRef = await addDoc(collection(db, 'rapports'), {
      ...rapport,
      dateRapport: Timestamp.fromDate(rapport.dateRapport),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Mettre à jour un rapport
  async update(id: string, rapport: Partial<Rapport>): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'rapports', id);
    const updateData: any = {
      ...rapport,
      updatedAt: Timestamp.now(),
    };
    
    if (rapport.dateRapport) {
      updateData.dateRapport = Timestamp.fromDate(rapport.dateRapport);
    }
    
    await updateDoc(docRef, updateData);
  },

  // Supprimer un rapport
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const docRef = doc(db, 'rapports', id);
    await deleteDoc(docRef);
  },

  // Générer un token d'accès pour rapport externe
  generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },
};
