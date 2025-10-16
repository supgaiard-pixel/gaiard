'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  GitBranch, 
  FileText, 
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Rediriger vers le dashboard si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Ne pas afficher la page d'accueil si l'utilisateur est connecté
  if (user) {
    return null;
  }

  const features = [
    {
      icon: Calendar,
      title: "Planning Interactif",
      description: "Gérez vos interventions avec un calendrier intuitif et des fonctionnalités de glisser-déposer."
    },
    {
      icon: Users,
      title: "Gestion des Équipes",
      description: "Organisez vos agents, leurs habilitations et suivez leurs disponibilités en temps réel."
    },
    {
      icon: BarChart3,
      title: "Tableau de Bord",
      description: "Visualisez vos métriques de performance et suivez l'avancement de vos projets."
    },
    {
      icon: GitBranch,
      title: "Timeline des Projets",
      description: "Planifiez et suivez les jalons de vos projets photovoltaïques avec des diagrammes de Gantt."
    },
    {
      icon: FileText,
      title: "Rapports Avancés",
      description: "Générez des rapports détaillés et exportez vos données en PDF ou Excel."
    },
    {
      icon: Shield,
      title: "Sécurité & Contrôle",
      description: "Gestion des rôles et permissions pour un contrôle total de l'accès aux données."
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Efficacité Maximale",
      description: "Optimisez vos ressources et réduisez les temps d'arrêt grâce à une planification intelligente."
    },
    {
      icon: Target,
      title: "Précision des Interventions",
      description: "Assurez-vous que chaque intervention est planifiée avec les bonnes compétences au bon moment."
    },
    {
      icon: Sparkles,
      title: "Interface Moderne",
      description: "Une expérience utilisateur intuitive et responsive pour une utilisation optimale sur tous les appareils."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header avec navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="font-bold text-xl text-gray-900">GAIAR</span>
            </div>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Se connecter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Planification
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Photovoltaïque</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              La solution complète pour gérer efficacement vos interventions, équipes et projets dans le domaine du photovoltaïque.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4">
                  Accéder à l'application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez tous les outils dont vous avez besoin pour optimiser votre gestion de projets photovoltaïques.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`transition-all duration-500 hover:shadow-lg hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir GAIAR ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution pensée pour les professionnels du photovoltaïque, par des professionnels.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className={`text-center transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: `${index * 200}ms` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Prêt à Optimiser Votre Gestion ?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez les professionnels qui font confiance à GAIAR pour gérer leurs projets photovoltaïques.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-xl">GAIAR</span>
          </div>
          <p className="text-gray-400 mb-4">
            Solution de planification pour professionnels du photovoltaïque
          </p>
          <p className="text-sm text-gray-500">
            © 2025 GAIAR. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
