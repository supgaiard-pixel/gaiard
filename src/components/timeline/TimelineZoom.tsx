'use client';

import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface TimelineZoomProps {
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  onFitToScreen: () => void;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export function TimelineZoom({ 
  onZoomChange, 
  onReset, 
  onFitToScreen, 
  initialZoom = 1,
  minZoom = 0.25,
  maxZoom = 3
}: TimelineZoomProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    setZoom(clampedZoom);
    onZoomChange(clampedZoom);
  };

  const handleZoomIn = () => {
    handleZoomChange(zoom + 0.25);
  };

  const handleZoomOut = () => {
    handleZoomChange(zoom - 0.25);
  };

  const handleReset = () => {
    handleZoomChange(1);
    onReset();
  };

  const handleFitToScreen = () => {
    onFitToScreen();
  };

  const handleSliderChange = (value: number[]) => {
    handleZoomChange(value[0]);
  };

  const getZoomPercentage = () => {
    return Math.round(zoom * 100);
  };

  const getZoomLabel = () => {
    if (zoom < 0.5) return 'Très petit';
    if (zoom < 0.75) return 'Petit';
    if (zoom < 1.25) return 'Normal';
    if (zoom < 1.75) return 'Grand';
    if (zoom < 2.25) return 'Très grand';
    return 'Énorme';
  };

  return (
    <div className="flex items-center space-x-2 bg-white border rounded-lg p-2 shadow-sm">
      {/* Boutons de zoom */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="h-8 w-8 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="h-8 w-8 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Slider de zoom */}
      <div className="flex items-center space-x-2 min-w-32">
        <span className="text-xs text-gray-500 w-8">{getZoomPercentage()}%</span>
        <div className="flex-1" ref={sliderRef}>
          <Slider
            value={[zoom]}
            onValueChange={handleSliderChange}
            min={minZoom}
            max={maxZoom}
            step={0.05}
            className="w-full"
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 w-8 p-0"
          title="Réinitialiser le zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleFitToScreen}
          className="h-8 w-8 p-0"
          title="Ajuster à l'écran"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicateur de zoom */}
      <div className="text-xs text-gray-600 min-w-0">
        <div className="font-medium">{getZoomLabel()}</div>
        <div className="text-gray-400">{getZoomPercentage()}%</div>
      </div>
    </div>
  );
}

