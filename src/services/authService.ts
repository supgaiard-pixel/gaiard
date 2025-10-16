import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, getDb } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'agent';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AuthUser extends User {
  role?: 'admin' | 'manager' | 'agent';
  permissions?: string[];
}

export const authService = {
  // Connexion avec email et mot de passe
  async signIn(email: string, password: string): Promise<AuthUser> {
    const auth = await getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user as AuthUser;
    
    // Récupérer le profil utilisateur depuis Firestore
    const userProfile = await this.getUserProfile(user.uid);
    if (userProfile) {
      user.role = userProfile.role;
      user.permissions = userProfile.permissions;
    }
    
    return user;
  },

  // Inscription avec email et mot de passe
  async signUp(email: string, password: string, displayName: string, role: 'admin' | 'manager' | 'agent' = 'agent'): Promise<AuthUser> {
    const auth = await getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user as AuthUser;
    
    // Mettre à jour le profil Firebase
    await updateProfile(user, { displayName });
    
    // Créer le profil utilisateur dans Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role,
      permissions: this.getDefaultPermissions(role),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    await this.createUserProfile(userProfile);
    
    user.role = role;
    user.permissions = userProfile.permissions;
    
    return user;
  },

  // Déconnexion
  async signOut(): Promise<void> {
    const auth = await getAuth();
    await signOut(auth);
  },

  // Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<void> {
    const auth = await getAuth();
    await sendPasswordResetEmail(auth, email);
  },

  // Écouter les changements d'état d'authentification
  async onAuthStateChanged(callback: (user: AuthUser | null) => void): Promise<() => void> {
    const auth = await getAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authUser = user as AuthUser;
        const userProfile = await this.getUserProfile(user.uid);
        if (userProfile) {
          authUser.role = userProfile.role;
          authUser.permissions = userProfile.permissions;
        }
        callback(authUser);
      } else {
        callback(null);
      }
    });
  },

  // Créer le profil utilisateur dans Firestore
  async createUserProfile(userProfile: UserProfile): Promise<void> {
    const db = await getDb();
    const userRef = doc(db, 'users', userProfile.uid);
    await setDoc(userRef, {
      ...userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  // Récupérer le profil utilisateur
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const db = await getDb();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        permissions: data.permissions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isActive: data.isActive
      };
    }
    return null;
  },

  // Mettre à jour le profil utilisateur
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const db = await getDb();
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
  },

  // Obtenir les permissions par défaut selon le rôle
  getDefaultPermissions(role: 'admin' | 'manager' | 'agent'): string[] {
    switch (role) {
      case 'admin':
        return [
          'read:agents', 'write:agents', 'delete:agents',
          'read:interventions', 'write:interventions', 'delete:interventions',
          'read:conges', 'write:conges', 'delete:conges',
          'read:users', 'write:users', 'delete:users',
          'read:reports', 'write:reports',
          'read:settings', 'write:settings'
        ];
      case 'manager':
        return [
          'read:agents', 'write:agents',
          'read:interventions', 'write:interventions',
          'read:conges', 'write:conges',
          'read:reports', 'write:reports'
        ];
      case 'agent':
        return [
          'read:agents',
          'read:interventions',
          'read:conges', 'write:conges'
        ];
      default:
        return [];
    }
  },

  // Vérifier si l'utilisateur a une permission
  hasPermission(user: AuthUser | null, permission: string): boolean {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  },

  // Vérifier si l'utilisateur a un rôle
  hasRole(user: AuthUser | null, role: 'admin' | 'manager' | 'agent'): boolean {
    if (!user || !user.role) return false;
    return user.role === role;
  },

  // Vérifier si l'utilisateur est admin
  isAdmin(user: AuthUser | null): boolean {
    return this.hasRole(user, 'admin');
  },

  // Vérifier si l'utilisateur est manager ou admin
  isManager(user: AuthUser | null): boolean {
    return this.hasRole(user, 'manager') || this.hasRole(user, 'admin');
  }
};
