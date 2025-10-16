'use client';

import { useState } from 'react';
import { Settings, Database, Palette, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Paramètres généraux
    nomEntreprise: 'Mon Entreprise Photovoltaïque',
    adresse: '123 Rue de l\'Énergie, 75001 Paris',
    telephone: '01 23 45 67 89',
    email: 'contact@monentreprise.fr',
    
    // Paramètres de planning
    heureDebut: '08:00',
    heureFin: '18:00',
    dureeInterventionDefaut: 8,
    afficherWeekends: true,
    
    // Notifications
    notificationsEmail: true,
    notificationsPlanning: true,
    rappelIntervention: 24,
    
    // Sécurité
    sessionTimeout: 30,
    motDePasseComplexe: true,
  });

  const handleSave = () => {
    // Ici vous pourrez sauvegarder les paramètres dans Firebase
    console.log('Sauvegarde des paramètres:', settings);
    alert('Paramètres sauvegardés avec succès !');
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      // Réinitialiser aux valeurs par défaut
      setSettings({
        nomEntreprise: 'Mon Entreprise Photovoltaïque',
        adresse: '123 Rue de l\'Énergie, 75001 Paris',
        telephone: '01 23 45 67 89',
        email: 'contact@monentreprise.fr',
        heureDebut: '08:00',
        heureFin: '18:00',
        dureeInterventionDefaut: 8,
        afficherWeekends: true,
        notificationsEmail: true,
        notificationsPlanning: true,
        rappelIntervention: 24,
        sessionTimeout: 30,
        motDePasseComplexe: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600">Configurez votre application</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Informations générales
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Planning
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Sécurité
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Informations générales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomEntreprise">Nom de l'entreprise</Label>
                    <Input
                      id="nomEntreprise"
                      value={settings.nomEntreprise}
                      onChange={(e) => setSettings({ ...settings, nomEntreprise: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={settings.telephone}
                      onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea
                    id="adresse"
                    value={settings.adresse}
                    onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Planning</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heureDebut">Heure de début</Label>
                    <Input
                      id="heureDebut"
                      type="time"
                      value={settings.heureDebut}
                      onChange={(e) => setSettings({ ...settings, heureDebut: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heureFin">Heure de fin</Label>
                    <Input
                      id="heureFin"
                      type="time"
                      value={settings.heureFin}
                      onChange={(e) => setSettings({ ...settings, heureFin: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dureeInterventionDefaut">Durée par défaut des interventions (heures)</Label>
                  <Input
                    id="dureeInterventionDefaut"
                    type="number"
                    value={settings.dureeInterventionDefaut}
                    onChange={(e) => setSettings({ ...settings, dureeInterventionDefaut: Number(e.target.value) })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="afficherWeekends">Afficher les week-ends</Label>
                    <p className="text-sm text-gray-600">Afficher les samedis et dimanches dans le planning</p>
                  </div>
                  <Switch
                    id="afficherWeekends"
                    checked={settings.afficherWeekends}
                    onCheckedChange={(checked) => setSettings({ ...settings, afficherWeekends: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsEmail">Notifications par email</Label>
                    <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
                  </div>
                  <Switch
                    id="notificationsEmail"
                    checked={settings.notificationsEmail}
                    onCheckedChange={(checked) => setSettings({ ...settings, notificationsEmail: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsPlanning">Notifications de planning</Label>
                    <p className="text-sm text-gray-600">Notifications pour les changements de planning</p>
                  </div>
                  <Switch
                    id="notificationsPlanning"
                    checked={settings.notificationsPlanning}
                    onCheckedChange={(checked) => setSettings({ ...settings, notificationsPlanning: checked })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rappelIntervention">Rappel d'intervention (heures avant)</Label>
                  <Input
                    id="rappelIntervention"
                    type="number"
                    value={settings.rappelIntervention}
                    onChange={(e) => setSettings({ ...settings, rappelIntervention: Number(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Sécurité</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="motDePasseComplexe">Mots de passe complexes</Label>
                    <p className="text-sm text-gray-600">Exiger des mots de passe complexes</p>
                  </div>
                  <Switch
                    id="motDePasseComplexe"
                    checked={settings.motDePasseComplexe}
                    onCheckedChange={(checked) => setSettings({ ...settings, motDePasseComplexe: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button variant="outline" onClick={handleReset}>
                Réinitialiser
              </Button>
              <Button onClick={handleSave}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
