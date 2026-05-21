import { useState } from "react";
import { useAdminSignup } from "../api/use-auth-admin";
import { getErrorMessage } from "#ecom/shared/lib/error-map";
import { Field } from "#ecom/shared/components/Field";
import { Input } from "#components/ui/input";
import { Button } from "#components/ui/button";

interface AdminSignupFormProps {
  onSuccess: () => void;
}

export function AdminSignupForm({ onSuccess }: AdminSignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const signup = useAdminSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signup.mutateAsync({ name, email, password });
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Field label="Name" error={null}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
        />
      </Field>
      <Field label="Email" error={null}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@example.com"
        />
      </Field>
      <Field label="Password" error={null}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Create a password"
        />
      </Field>
      <Button type="submit" disabled={signup.isPending} className="w-full">
        {signup.isPending ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
