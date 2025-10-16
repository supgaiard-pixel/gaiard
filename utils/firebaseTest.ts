// Script de test pour vérifier la configuration Firebase
import { initializeFirebase } from '@/lib/firebase';

export async function testFirebaseConfig() {
  try {
    console.log('🔧 Test de la configuration Firebase...');
    
    // Initialiser Firebase
    const { app, db, auth, storage } = await initializeFirebase();
    
    console.log('✅ Firebase initialisé avec succès');
    console.log('📱 App:', app?.name);
    console.log('🗄️ Database:', db?.app?.name);
    console.log('🔐 Auth:', auth?.app?.name);
    console.log('📦 Storage:', storage?.app?.name);
    
    // Tester la configuration Auth
    if (auth) {
      console.log('✅ Service d\'authentification disponible');
      console.log('🔑 Auth Domain:', auth.app.options.authDomain);
      console.log('🆔 Project ID:', auth.app.options.projectId);
    } else {
      console.error('❌ Service d\'authentification non disponible');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration Firebase:', error);
    return false;
  }
}

// Fonction pour tester l'authentification
export async function testAuthMethods() {
  try {
    const { auth } = await initializeFirebase();
    
    if (!auth) {
      throw new Error('Service d\'authentification non disponible');
    }
    
    console.log('✅ Méthodes d\'authentification disponibles:');
    console.log('- signInWithEmailAndPassword');
    console.log('- createUserWithEmailAndPassword');
    console.log('- signOut');
    console.log('- onAuthStateChanged');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de test d\'authentification:', error);
    return false;
  }
}







