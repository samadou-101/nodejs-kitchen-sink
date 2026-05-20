import { useState } from "react";
import { useAdminLogin } from "../api/use-auth-admin";
import { getErrorMessage } from "#shared/lib/error-map";

interface AdminLoginFormProps {
  onSuccess: () => void;
}

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAdminLogin();

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
      <h2 className="text-xl font-bold">Admin Login</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label htmlFor="admin-email" className="block text-sm font-medium">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-sm font-medium">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </div>
      <button
        type="submit"
        disabled={login.isPending}
        className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {login.isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
