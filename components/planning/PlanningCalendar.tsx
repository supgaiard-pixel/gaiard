'use client';

import { useState } from 'react';
import { Calendar, CalendarProps, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Intervention } from '@/types';
import { CategorieIntervention } from '@/types';

// Configuration du localizer pour moment.js
const localizer = momentLocalizer(moment);

// Configuration des couleurs par catégorie
const getCategorieColor = (categorie: CategorieIntervention) => {
  const colors = {
    [CategorieIntervention.INSTALLATION]: '#3B82F6', // Bleu
    [CategorieIntervention.MAINTENANCE]: '#10B981', // Vert
    [CategorieIntervention.REPARATION]: '#F59E0B', // Orange
    [CategorieIntervention.CONTROLE]: '#8B5CF6', // Violet
    [CategorieIntervention.FORMATION]: '#EF4444', // Rouge
    [CategorieIntervention.AUTRE]: '#6B7280', // Gris
  };
  return colors[categorie] || colors[CategorieIntervention.AUTRE];
};

interface PlanningCalendarProps {
  interventions: Intervention[];
  selectedDate: Date;
  view: 'month' | 'week' | 'day';
  onDateChange: (date: Date) => void;
  onEditIntervention: (intervention: Intervention) => void;
}

export function PlanningCalendar({
  interventions,
  selectedDate,
  view,
  onDateChange,
  onEditIntervention
}: PlanningCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Intervention | null>(null);

  // Conversion des interventions en format pour react-big-calendar
  const events = interventions.map(intervention => ({
    id: intervention.id,
    title: intervention.titre,
    start: intervention.dateDebut,
    end: intervention.dateFin,
    resource: intervention,
    style: {
      backgroundColor: getCategorieColor(intervention.categorie),
      borderColor: getCategorieColor(intervention.categorie),
      color: 'white',
      borderRadius: '4px',
      border: 'none',
    }
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    onEditIntervention(event.resource);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Créer une nouvelle intervention à la date sélectionnée
    const newIntervention: Partial<Intervention> = {
      dateDebut: slotInfo.start,
      dateFin: slotInfo.end,
    };
    onEditIntervention(newIntervention as Intervention);
  };

  const eventStyleGetter = (event: any) => {
    const intervention = event.resource as Intervention;
    return {
      style: {
        backgroundColor: getCategorieColor(intervention.categorie),
        borderColor: getCategorieColor(intervention.categorie),
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        opacity: intervention.statut === 'terminee' ? 0.7 : 1,
      }
    };
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucune intervention dans cette période',
    showMore: (total: number) => `+ ${total} autres`,
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        date={selectedDate}
        onNavigate={onDateChange}
        view={view}
        onView={() => {}} // Géré par le parent
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        messages={messages}
        step={30}
        timeslots={2}
        showMultiDayTimes
        popup
        popupOffset={{ x: 0, y: 0 }}
        className="rbc-calendar"
      />
    </div>
  );
}
