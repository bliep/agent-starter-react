'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/shadcn/utils';
import {
  LESSON_MODE_LABELS,
  LessonMode,
  type ModeRequest,
  SCENARIO_LABELS,
  Scenario,
} from '@/lib/tutor-drill';

interface ModePickerProps {
  request: ModeRequest;
  onChange: (request: ModeRequest) => void;
  disabled: boolean;
  className?: string;
}

/** Lesson mode during a call, plus the scenario in role-play. */
export function ModePicker({ request, onChange, disabled, className }: ModePickerProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <label htmlFor="lesson-mode" className="text-muted-foreground max-md:sr-only">
        Mode
      </label>
      <Select
        value={request.mode}
        disabled={disabled}
        onValueChange={(mode) => onChange({ ...request, mode: mode as LessonMode })}
      >
        <SelectTrigger id="lesson-mode" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(LessonMode).map((mode) => (
            <SelectItem key={mode} value={mode}>
              {LESSON_MODE_LABELS[mode]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {request.mode === LessonMode.RolePlay && (
        <Select
          value={request.scenario}
          disabled={disabled}
          onValueChange={(scenario) => onChange({ ...request, scenario: scenario as Scenario })}
        >
          <SelectTrigger aria-label="Scenario" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Scenario).map((scenario) => (
              <SelectItem key={scenario} value={scenario}>
                {SCENARIO_LABELS[scenario]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
