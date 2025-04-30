import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationBadgeProps {
  hasNotification?: boolean;
  className?: string;
}

export function NotificationBadge({ hasNotification, className }: NotificationBadgeProps) {
  if (!hasNotification) return null;

  return (
    <div className={cn(
      "relative inline-block",
      className
    )}>
      <Bell className="h-4 w-4 text-muted-foreground" />
      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
    </div>
  );
}