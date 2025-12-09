import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
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

interface TagAutocompleteProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagAutocomplete({
  value = [],
  onChange,
  placeholder = 'Type and press Enter to add tags',
  className,
}: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get tag color
  const getTagColor = (tagLabel: string): string => {
    const predefined = PREDEFINED_TAGS.find((t) => t.label.toLowerCase() === tagLabel.toLowerCase());
    if (predefined) return predefined.color;
    
    // Assign color based on hash of tag name for consistency
    const hash = tagLabel.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLOR_PALETTE[hash % COLOR_PALETTE.length];
  };

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = PREDEFINED_TAGS.filter(
        (tag) =>
          tag.label.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(tag.label)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagLabel: string) => {
    const trimmed = tagLabel.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (tag: Tag) => {
    addTag(tag.label);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => {
          const color = getTagColor(tag);
          return (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white',
                color
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (inputValue.trim()) {
              setShowSuggestions(true);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleSuggestionClick(tag)}
              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
            >
              <span className={cn('w-3 h-3 rounded-full', tag.color)} />
              <span className="text-sm">{tag.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

