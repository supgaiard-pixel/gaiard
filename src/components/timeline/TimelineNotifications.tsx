'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { JalonProjet, StatutJalonProjet } from '@/types';
import { DependanceViolation, SeveriteViolation } from '@/types/dependencies';

interface TimelineNotificationsProps {
  jalons: JalonProjet[];
  violations?: DependanceViolation[];
  onJalonClick?: (jalon: JalonProjet) => void;
}

const statutJalonLabels: Record<StatutJalonProjet, string> = {
  [StatutJalonProjet.EN_ATTENTE]: 'En attente',
  [StatutJalonProjet.EN_COURS]: 'En cours',
  [StatutJalonProjet.TERMINE]: 'Terminé',
  [StatutJalonProjet.RETARDE]: 'Retardé',
  [StatutJalonProjet.ANNULE]: 'Annulé',
};

export function TimelineNotifications({ jalons, violations = [], onJalonClick }: TimelineNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  interface NotificationItem {
    id: string;
    type: 'jalon_retard' | 'jalon_approche' | 'violation' | 'jalon_termine';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    jalon?: JalonProjet;
    violation?: DependanceViolation;
    createdAt: Date;
    isRead: boolean;
  }

  // Calculer les notifications
  useEffect(() => {
    const newNotifications: NotificationItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Notifications pour jalons en retard
    jalons.forEach(jalon => {
      const echeance = new Date(jalon.dateEcheance);
      echeance.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (jalon.statut !== StatutJalonProjet.TERMINE && echeance < today) {
        // Jalon en retard
        newNotifications.push({
          id: `jalon_retard_${jalon.id}`,
          type: 'jalon_retard',
          title: `Jalon en retard`,
          message: `Le jalon "${jalon.titre}" était prévu le ${jalon.dateEcheance.toLocaleDateString('fr-FR')}`,
          severity: 'high',
          jalon,
          createdAt: new Date(),
          isRead: false,
        });
      } else if (jalon.statut !== StatutJalonProjet.TERMINE && daysDiff <= 3 && daysDiff >= 0) {
        // Jalon qui approche
        newNotifications.push({
          id: `jalon_approche_${jalon.id}`,
          type: 'jalon_approche',
          title: `Jalon qui approche`,
          message: `Le jalon "${jalon.titre}" est prévu dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`,
          severity: daysDiff === 0 ? 'high' : 'medium',
          jalon,
          createdAt: new Date(),
          isRead: false,
        });
      } else if (jalon.statut === StatutJalonProjet.TERMINE) {
        // Jalon terminé récemment
        const completedRecently = (today.getTime() - new Date(jalon.updatedAt).getTime()) <= (7 * 24 * 60 * 60 * 1000);
        if (completedRecently) {
          newNotifications.push({
            id: `jalon_termine_${jalon.id}`,
            type: 'jalon_termine',
            title: `Jalon terminé`,
            message: `Le jalon "${jalon.titre}" a été marqué comme terminé`,
            severity: 'low',
            jalon,
            createdAt: new Date(),
            isRead: false,
          });
        }
      }
    });

    // Notifications pour violations de dépendances
    violations.forEach(violation => {
      newNotifications.push({
        id: `violation_${violation.dependanceId}`,
        type: 'violation',
        title: `Violation de dépendance`,
        message: violation.message,
        severity: violation.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
        violation,
        createdAt: violation.createdAt,
        isRead: false,
      });
    });

    // Trier par sévérité et date
    newNotifications.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    setNotifications(newNotifications);
  }, [jalons, violations]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    if (notification.jalon && onJalonClick) {
      onJalonClick(notification.jalon);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} non lues</Badge>
                )}
              </CardTitle>
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
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-300 shadow-sm'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getSeverityColor(notification.severity)}`}>
                      {getSeverityIcon(notification.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <Badge 
                          className={`text-xs ${getSeverityColor(notification.severity)}`}
                        >
                          {notification.severity}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.jalon && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Target className="h-3 w-3" />
                          <span>{notification.jalon.titre}</span>
                          <span>•</span>
                          <span>{statutJalonLabels[notification.jalon.statut]}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-1">
                        {notification.createdAt.toLocaleDateString('fr-FR')} à {notification.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

