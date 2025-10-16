'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Phase, JalonProjet } from '@/types';

interface TimelineDragDropProps {
  phases: Phase[];
  jalons: JalonProjet[];
  onReorder: (type: 'phase' | 'jalon', itemId: string, newOrder: number) => void;
  onMove: (type: 'phase' | 'jalon', itemId: string, direction: 'up' | 'down') => void;
}

interface DragItem {
  id: string;
  type: 'phase' | 'jalon';
  order: number;
  element: HTMLElement;
}

export function TimelineDragDrop({ phases, jalons, onReorder, onMove }: TimelineDragDropProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Gérer le début du drag
  const handleDragStart = (e: React.DragEvent, item: Phase | JalonProjet, type: 'phase' | 'jalon') => {
    const dragItem: DragItem = {
      id: item.id,
      type,
      order: item.ordre,
      element: e.currentTarget as HTMLElement,
    };
    
    setDraggedItem(dragItem);
    setIsDragging(true);
    
    // Ajouter des classes CSS pour le style de drag
    e.currentTarget.classList.add('opacity-50', 'rotate-2');
    
    // Définir l'effet de drag
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragItem));
  };

  // Gérer la fin du drag
  const handleDragEnd = (e: React.DragEvent) => {
    // Nettoyer les classes CSS
    e.currentTarget.classList.remove('opacity-50', 'rotate-2');
    
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
  };

  // Gérer le survol pendant le drag
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverItem(targetId);
  };

  // Gérer le drop
  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'phase' | 'jalon') => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Trouver l'élément cible
    const targetItem = targetType === 'phase' 
      ? phases.find(p => p.id === targetId)
      : jalons.find(j => j.id === targetId);
    
    if (!targetItem) return;
    
    // Calculer le nouvel ordre
    let newOrder = targetItem.ordre;
    
    // Si on déplace vers le bas, incrémenter l'ordre
    if (draggedItem.order < targetItem.ordre) {
      newOrder = targetItem.ordre;
    } else if (draggedItem.order > targetItem.ordre) {
      newOrder = targetItem.ordre;
    }
    
    // Appeler la fonction de réorganisation
    onReorder(draggedItem.type, draggedItem.id, newOrder);
    
    setDragOverItem(null);
  };

  // Gérer le déplacement avec les flèches
  const handleMove = (item: Phase | JalonProjet, type: 'phase' | 'jalon', direction: 'up' | 'down') => {
    onMove(type, item.id, direction);
  };

  // Rendre les éléments avec drag & drop
  const renderDraggableItem = (item: Phase | JalonProjet, type: 'phase' | 'jalon') => {
    const isDragged = draggedItem?.id === item.id;
    const isDragOver = dragOverItem === item.id;
    
    return (
      <div
        key={`${type}_${item.id}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item, type)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, item.id)}
        onDrop={(e) => handleDrop(e, item.id, type)}
        className={`
          flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 cursor-move
          ${isDragged ? 'opacity-50 rotate-2' : ''}
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
          ${isDragging && !isDragged ? 'hover:bg-gray-50' : ''}
        `}
      >
        {/* Handle de drag */}
        <div className="flex-shrink-0">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        
        {/* Contenu de l'élément */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">
            {type === 'phase' ? (item as Phase).nom : (item as JalonProjet).titre}
          </div>
          <div className="text-xs text-gray-500">
            Ordre: {item.ordre}
          </div>
        </div>
        
        {/* Boutons de déplacement */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMove(item, type, 'up')}
            className="h-6 w-6 p-0"
            disabled={item.ordre <= 1}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMove(item, type, 'down')}
            className="h-6 w-6 p-0"
            disabled={item.ordre >= (type === 'phase' ? phases.length : jalons.length)}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div ref={dragRef} className="space-y-2">
      {/* Phases */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Phases</h4>
        <div className="space-y-1">
          {phases
            .sort((a, b) => a.ordre - b.ordre)
            .map(phase => renderDraggableItem(phase, 'phase'))}
        </div>
      </div>
      
      {/* Jalons */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Jalons</h4>
        <div className="space-y-1">
          {jalons
            .sort((a, b) => a.ordre - b.ordre)
            .map(jalon => renderDraggableItem(jalon, 'jalon'))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>💡 Glissez-déposez pour réorganiser • Utilisez les flèches pour des ajustements fins</p>
      </div>
    </div>
  );
}

