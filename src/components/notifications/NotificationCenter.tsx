'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  RefreshCw
} from 'lucide-react';
import { Agent, Projet, Phase, JalonProjet, Conge } from '@/types';
import { format, isPast, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  agents: Agent[];
  projets: Projet[];
  phases: Phase[];
  jalons: JalonProjet[];
  conges: Conge[];
}

export function NotificationCenter({ 
  agents, 
  projets, 
  phases, 
  jalons, 
  conges 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Générer les notifications basées sur les données
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Jalons en retard
    const jalonsEnRetard = jalons.filter(jalon => 
      isPast(jalon.dateEcheance) && jalon.statut !== 'termine' && jalon.statut !== 'annule'
    );
    
    jalonsEnRetard.forEach(jalon => {
      newNotifications.push({
        id: `jalon-retard-${jalon.id}`,
        type: 'error',
        title: 'Jalon en retard',
        message: `Le jalon "${jalon.titre}" est en retard depuis ${differenceInDays(new Date(), jalon.dateEcheance)} jour(s)`,
        timestamp: new Date(),
        read: false
      });
    });

    // Jalons critiques (dans les 3 prochains jours)
    const jalonsCritiques = jalons.filter(jalon => {
      const joursRestants = differenceInDays(jalon.dateEcheance, new Date());
      return joursRestants <= 3 && joursRestants >= 0 && jalon.statut !== 'termine';
    });
    
    jalonsCritiques.forEach(jalon => {
      newNotifications.push({
        id: `jalon-critique-${jalon.id}`,
        type: 'warning',
        title: 'Jalon critique',
        message: `Le jalon "${jalon.titre}" arrive à échéance dans ${differenceInDays(jalon.dateEcheance, new Date())} jour(s)`,
        timestamp: new Date(),
        read: false
      });
    });

    // Agents en congé aujourd'hui
    const agentsEnCongeAujourdhui = conges.filter(conge => {
      const aujourdhui = new Date();
      return aujourdhui >= conge.dateDebut && aujourdhui <= conge.dateFin;
    });
    
    agentsEnCongeAujourdhui.forEach(conge => {
      const agent = agents.find(a => a.id === conge.agentId);
      if (agent) {
        newNotifications.push({
          id: `conge-aujourdhui-${conge.id}`,
          type: 'info',
          title: 'Agent en congé',
          message: `${agent.prenom} ${agent.nom} est en congé aujourd'hui (${conge.type})`,
          timestamp: new Date(),
          read: false
        });
      }
    });

    // Agents en congé demain
    const agentsEnCongeDemain = conges.filter(conge => {
      const demain = new Date();
      demain.setDate(demain.getDate() + 1);
      return demain >= conge.dateDebut && demain <= conge.dateFin;
    });
    
    agentsEnCongeDemain.forEach(conge => {
      const agent = agents.find(a => a.id === conge.agentId);
      if (agent) {
        newNotifications.push({
          id: `conge-demain-${conge.id}`,
          type: 'info',
          title: 'Congé prévu',
          message: `${agent.prenom} ${agent.nom} sera en congé demain (${conge.type})`,
          timestamp: new Date(),
          read: false
        });
      }
    });

    // Surcharge d'agents
    const agentsSurcharges = agents.filter(agent => {
      const phasesAgent = phases.filter(phase => phase.agents.includes(agent.id));
      return phasesAgent.length > 8;
    });
    
    agentsSurcharges.forEach(agent => {
      const phasesAgent = phases.filter(phase => phase.agents.includes(agent.id));
      newNotifications.push({
        id: `surcharge-${agent.id}`,
        type: 'warning',
        title: 'Surcharge détectée',
        message: `${agent.prenom} ${agent.nom} a ${phasesAgent.length} phases assignées`,
        timestamp: new Date(),
        read: false
      });
    });

    // Phases terminées récemment
    const phasesTerminees = phases.filter(phase => {
      const semaineDerniere = new Date();
      semaineDerniere.setDate(semaineDerniere.getDate() - 7);
      return phase.statut === 'termine' && phase.updatedAt >= semaineDerniere;
    });
    
    if (phasesTerminees.length > 0) {
      newNotifications.push({
        id: 'phases-terminees',
        type: 'success',
        title: 'Phases terminées',
        message: `${phasesTerminees.length} phase(s) terminée(s) cette semaine`,
        timestamp: new Date(),
        read: false
      });
    }

    setNotifications(newNotifications);
  }, [agents, projets, phases, jalons, conges]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notifications */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Tout marquer comme lu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(notification.timestamp, 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}








