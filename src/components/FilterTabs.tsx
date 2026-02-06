import { cn } from '@/lib/utils';

interface FilterTabsProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function FilterTabs({ value, onChange, options }: FilterTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
