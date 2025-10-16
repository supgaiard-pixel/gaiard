// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA-saU5cKLoSWhASqO4cJFfAkp-Pep2rc4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gaiard.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gaiard",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gaiard.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "818261508053",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:818261508053:web:b563d1d2f2b41a0c5c875c",
};

// Fonction pour initialiser Firebase de manière sécurisée
let firebaseApp: any = null;
let firestoreDb: any = null;
let firebaseAuth: any = null;
let firebaseStorage: any = null;

export const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase ne peut pas être initialisé côté serveur');
  }

  if (firebaseApp) {
    return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth, storage: firebaseStorage };
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    // Initialiser Firebase si pas déjà fait
    const apps = getApps();
    if (apps.length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = apps[0];
    }

    // Initialiser les services
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    console.log('Firebase initialisé avec succès:', { app: firebaseApp, db: firestoreDb });
    
    return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth, storage: firebaseStorage };
  } catch (error) {
    console.error('Erreur d\'initialisation Firebase:', error);
    throw error;
  }
};

// Fonction pour obtenir l'instance Firestore
export const getDb = async () => {
  if (!firestoreDb) {
    await initializeFirebase();
  }
  return firestoreDb;
};

// Fonction pour obtenir l'instance Auth
export const getAuth = async () => {
  if (!firebaseAuth) {
    await initializeFirebase();
  }
  return firebaseAuth;
};

// Fonction pour obtenir l'instance Storage
export const getStorage = async () => {
  if (!firebaseStorage) {
    await initializeFirebase();
  }
  return firebaseStorage;
};

// Export des instances (pour compatibilité)
export const db = firestoreDb;
export const auth = firebaseAuth;
export const storage = firebaseStorage;
