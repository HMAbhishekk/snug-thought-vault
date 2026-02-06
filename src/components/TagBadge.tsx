import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

const tagColors: Record<string, { bg: string; text: string }> = {
  work: { bg: 'bg-tag-blue', text: 'text-tag-blue-text' },
  personal: { bg: 'bg-tag-green', text: 'text-tag-green-text' },
  important: { bg: 'bg-tag-pink', text: 'text-tag-pink-text' },
  idea: { bg: 'bg-tag-purple', text: 'text-tag-purple-text' },
  todo: { bg: 'bg-tag-orange', text: 'text-tag-orange-text' },
};

function getTagColor(tag: string) {
  const normalized = tag.toLowerCase();
  if (tagColors[normalized]) return tagColors[normalized];
  
  // Generate consistent color based on tag string
  const colors = Object.values(tagColors);
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  const colors = getTagColor(tag);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all",
        colors.bg,
        colors.text,
        className
      )}
    >
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
