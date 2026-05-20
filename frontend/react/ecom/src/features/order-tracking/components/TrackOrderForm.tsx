import { useState } from "react";

interface TrackOrderFormProps {
  onSubmit: (phone: string) => void;
  isLoading: boolean;
}

export function TrackOrderForm({ onSubmit, isLoading }: TrackOrderFormProps) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) onSubmit(phone.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number"
        required
        className="flex-1 rounded border p-2"
      />
      <button
        type="submit"
        disabled={isLoading || !phone.trim()}
        className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? "Searching..." : "Track"}
      </button>
    </form>
  );
}
