import { Input } from './ui/input'
import { Label } from './ui/label'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar as CalendarIcon, AlertCircle, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '../lib/utils'
import { CustomField } from '../shared/types'

interface CustomFieldInputProps {
  field: CustomField
  value: any
  onChange: (value: any) => void
  error?: string
  className?: string
}

export function CustomFieldInput({ field, value, onChange, error, className }: CustomFieldInputProps) {
  // Handle different field types
  switch (field.type) {
    case 'date':
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-destructive"
                )}
                id={field.key}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP', { locale: de }) : <span>Datum wählen</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                initialFocus
                locale={de}
              />
            </PopoverContent>
          </Popover>
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
      
    case 'number':
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.key}
            type="number"
            className={cn(error && "border-destructive")}
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          />
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
      
    case 'money':
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              €
            </span>
            <Input
              id={field.key}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={cn("pl-7", error && "border-destructive")}
              value={value || ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
      
    case 'email':
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <Input
              id={field.key}
              type="email"
              className={cn("pl-9", error && "border-destructive")}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
      
    case 'phone':
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Phone className="h-4 w-4" />
            </span>
            <Input
              id={field.key}
              type="tel"
              className={cn("pl-9", error && "border-destructive")}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
      
    case 'select':
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={value || ''}
            onValueChange={(val) => onChange(val)}
          >
            <SelectTrigger 
              id={field.key}
              className={cn(error && "border-destructive")}
            >
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
      
    case 'text':
    default:
      return (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.key}
            type="text"
            className={cn(error && "border-destructive")}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>
      );
  }
}