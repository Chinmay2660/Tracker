import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tag {
  label: string;
  color: string;
}

// Predefined tags with colors
const PREDEFINED_TAGS: Tag[] = [
  { label: 'Remote', color: 'bg-blue-500' },
  { label: 'Hybrid', color: 'bg-purple-500' },
  { label: 'On-site', color: 'bg-green-500' },
  { label: 'Startup', color: 'bg-orange-500' },
  { label: 'Big Tech', color: 'bg-red-500' },
  { label: 'Product', color: 'bg-pink-500' },
  { label: 'Engineering', color: 'bg-indigo-500' },
  { label: 'Design', color: 'bg-cyan-500' },
  { label: 'Marketing', color: 'bg-yellow-500' },
  { label: 'Sales', color: 'bg-teal-500' },
  { label: 'Full-time', color: 'bg-emerald-500' },
  { label: 'Part-time', color: 'bg-amber-500' },
  { label: 'Contract', color: 'bg-rose-500' },
  { label: 'Internship', color: 'bg-violet-500' },
];

// Color palette for auto-assigning colors to custom tags
const COLOR_PALETTE = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
];

interface TagSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagSelect({
  value = [],
  onChange,
  placeholder = 'Select tags',
  className,
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get tag color
  const getTagColor = (tagLabel: string): string => {
    const predefined = PREDEFINED_TAGS.find((t) => t.label.toLowerCase() === tagLabel.toLowerCase());
    if (predefined) return predefined.color;
    
    // Assign color based on hash of tag name for consistency
    const hash = tagLabel.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLOR_PALETTE[hash % COLOR_PALETTE.length];
  };

  // Get available tags (not already selected)
  const availableTags = PREDEFINED_TAGS.filter(
    (tag) => !value.includes(tag.label)
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagLabel: string) => {
    if (value.includes(tagLabel)) {
      onChange(value.filter((tag) => tag !== tagLabel));
    } else {
      onChange([...value, tagLabel]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected tags display */}
      <div
        className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-input rounded-md bg-background cursor-pointer hover:border-ring transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          value.map((tag) => {
            const color = getTagColor(tag);
            return (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white',
                  color
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-sm text-muted-foreground flex items-center h-full">
            {placeholder}
          </span>
        )}
        <div className="ml-auto flex items-center">
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {availableTags.length > 0 ? (
            availableTags.map((tag) => {
              const isSelected = value.includes(tag.label);
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                >
                  <span className={cn('w-3 h-3 rounded-full', tag.color)} />
                  <span className="text-sm flex-1">{tag.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              All tags selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}

