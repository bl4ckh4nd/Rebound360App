import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TitleBarProps {
  title?: string;
  className?: string;
}

export function TitleBar({ title = 'Rebound360', className }: TitleBarProps) {
  const handleMinimize = () => {
    window.electron.invoke('window-control', 'minimize');
  };

  const handleMaximize = () => {
    window.electron.invoke('window-control', 'maximize');
  };

  const handleClose = () => {
    window.electron.invoke('window-control', 'close');
  };

  return (
    <div 
      className={cn(
        "h-9 flex items-center justify-between bg-background border-b border-border select-none",
        "draggable", // CSS class for making this region draggable
        className
      )}
    >
      <div className="flex items-center px-3">
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center">
        <button 
          onClick={handleMinimize}
          className="h-9 w-12 flex items-center justify-center hover:bg-muted transition-colors focus:outline-none"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={handleMaximize}
          className="h-9 w-12 flex items-center justify-center hover:bg-muted transition-colors focus:outline-none"
        >
          <Square size={14} />
        </button>
        <button 
          onClick={handleClose}
          className="h-9 w-12 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors focus:outline-none"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
