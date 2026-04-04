'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check, Search } from 'lucide-react'

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export function SearchableSelect({ value, onChange, options, placeholder = 'Select...', className }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false)
      setSearch('')
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (open && listRef.current && value) {
      const selected = listRef.current.querySelector('[data-selected="true"]')
      if (selected) selected.scrollIntoView({ block: 'nearest' })
    }
  }, [open, value])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-[13px] text-left transition-colors',
          'hover:bg-muted/50',
          open && 'border-foreground/20',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div ref={listRef} className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-[13px] text-muted-foreground text-center">No results</div>
            ) : (
              filtered.map((option) => {
                const isSelected = value === option
                return (
                  <button
                    key={option}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => {
                      onChange(option)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-left transition-colors',
                      isSelected ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                    )}
                  >
                    <span className="flex-1 truncate">{option}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-foreground flex-shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
