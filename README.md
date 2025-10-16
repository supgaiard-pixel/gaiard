# Gaiard - Planification Photovoltaïque

Application web de planification pour conducteurs de travaux dans le photovoltaïque.

## 🚀 Fonctionnalités

### Version actuelle
- **Planning interactif** : Glissez-déposez et redimensionnez vos interventions
- **Gestion des agents** : CRUD complet avec habilitations et couleurs distinctes
- **Gestion des congés** : Suivi des absences et disponibilités
- **Filtres avancés** : Par catégorie, agent, statut d'intervention
- **Interface responsive** : Design moderne et adaptatif

### Fonctionnalités futures
- **Jalons** : Suivi des étapes de projet
- **Notifications** : Alertes et rappels
- **Exports** : PDF, Excel
- **Authentification** : Connexion sécurisée
- **Synchronisation** : Données en temps réel

## 🛠️ Stack technique

- **Frontend** : Next.js 15, React 18, TypeScript
- **UI** : TailwindCSS, shadcn/ui
- **Drag & Drop** : @dnd-kit
- **Calendrier** : react-big-calendar
- **Backend** : Firebase (Firestore, Auth, Storage)
- **Gestion d'état** : Zustand
- **Icons** : Lucide React

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd gaiard
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**
   - Copiez `env.example` vers `.env.local`
   - Remplissez vos clés Firebase dans `.env.local`

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 🔧 Configuration Firebase

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Activez Firestore Database
3. Activez Authentication
4. Activez Storage
5. Copiez vos clés de configuration dans `.env.local`

### Structure Firestore

```
/agents
  - {agentId}
    - nom: string
    - prenom: string
    - email: string
    - telephone: string
    - habilitations: string[]
    - couleur: string
    - actif: boolean
    - createdAt: timestamp
    - updatedAt: timestamp

/interventions
  - {interventionId}
    - titre: string
    - description: string
    - agentId: string
    - dateDebut: timestamp
    - dateFin: timestamp
    - duree: number
    - categorie: enum
    - statut: enum
    - adresse: string
    - client: string
    - notes: string
    - createdAt: timestamp
    - updatedAt: timestamp

/conges
  - {congeId}
    - agentId: string
    - dateDebut: timestamp
    - dateFin: timestamp
    - type: enum
    - statut: enum
    - motif: string
    - createdAt: timestamp
    - updatedAt: timestamp
```

## 🎨 Design

L'application utilise un design moderne avec :
- **Couleurs distinctes** par catégorie d'intervention
- **Interface responsive** pour mobile et desktop
- **Composants réutilisables** avec shadcn/ui
- **Navigation intuitive** avec indicateurs visuels

### Couleurs par catégorie
- 🔵 **Installation** : Bleu (#3B82F6)
- 🟢 **Maintenance** : Vert (#10B981)
- 🟠 **Réparation** : Orange (#F59E0B)
- 🟣 **Contrôle** : Violet (#8B5CF6)
- 🔴 **Formation** : Rouge (#EF4444)
- ⚫ **Autre** : Gris (#6B7280)

## 📱 Pages

- **/** : Page d'accueil avec navigation
- **/planning** : Planning interactif avec calendrier
- **/agents** : Gestion des agents et habilitations
- **/conges** : Gestion des congés et absences
- **/settings** : Configuration de l'application

## 🔄 Gestion d'état

L'application utilise Zustand pour la gestion d'état avec :
- **Store centralisé** : `usePlanningStore`
- **Actions typées** : CRUD pour tous les modèles
- **Filtres persistants** : État des filtres sauvegardé
- **Interface réactive** : Mise à jour automatique de l'UI

## 🚀 Déploiement

### Vercel (recommandé)
```bash
npm run build
vercel --prod
```

### Autres plateformes
```bash
npm run build
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour l'industrie photovoltaïque**