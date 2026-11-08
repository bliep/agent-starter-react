'use client';

import { useSessionContext } from '@livekit/components-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/shadcn/utils';
import { LEVEL_LABELS, Level, parseLevel } from '@/lib/tutor-level';

interface LevelPickerProps {
  level: Level;
  onLevelChange: (level: Level) => void;
  className?: string;
}

/** CEFR level choice before the call starts. Hidden once connected (level is fixed per call). */
export function LevelPicker({ level, onLevelChange, className }: LevelPickerProps) {
  const { isConnected } = useSessionContext();
  if (isConnected) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <label htmlFor="tutor-level" className="text-muted-foreground">
        Your level
      </label>
      <Select value={level} onValueChange={(value) => onLevelChange(parseLevel(value))}>
        <SelectTrigger id="tutor-level" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Level).map((value) => (
            <SelectItem key={value} value={value}>
              {LEVEL_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
