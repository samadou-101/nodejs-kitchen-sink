import { useState } from "react";
import { useEmployeeLogin } from "../api/use-auth-employee";
import { getErrorMessage } from "#shared/lib/error-map";
import { Field } from "#shared/components/Field";
import { Input } from "#components/components/ui/input";
import { Button } from "#components/components/ui/button";

interface EmployeeLoginFormProps {
  onSuccess: () => void;
}

export function EmployeeLoginForm({ onSuccess }: EmployeeLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useEmployeeLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
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
      <Field label="Email" error={null}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="employee@example.com"
        />
      </Field>
      <Field label="Password" error={null}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </Field>
      <Button type="submit" disabled={login.isPending} className="w-full">
        {login.isPending ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
