import { Input } from "#components/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <Input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
