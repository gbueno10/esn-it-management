'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  placeholder?: string
  maxDate?: Date
  minDate?: Date
  className?: string
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', maxDate, minDate, className }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const display = value ? format(new Date(value + 'T00:00:00'), 'dd MMM yyyy') : null

  return (
    <div className={cn('relative group', className)}>
      {/* Hidden native date input */}
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
        min={minDate ? minDate.toISOString().split('T')[0] : undefined}
        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
        tabIndex={-1}
      />

      {/* Visual trigger */}
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker?.()}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-card px-3 text-sm text-left transition-all',
          'hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 outline-none',
          !display && 'text-muted-foreground/60'
        )}
      >
        <span className="truncate">{display || placeholder}</span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="p-0.5 rounded hover:bg-muted transition-colors relative z-20"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
          <CalendarIcon className="h-4 w-4 text-muted-foreground/60" />
        </div>
      </button>
    </div>
  )
}
