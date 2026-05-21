import { type FormEvent, useState } from "react";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="border-y bg-card py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Newsletter
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Stay in the Loop
          </h2>
          <p className="mt-3 text-muted-foreground">
            First access to new drops, exclusive releases, and local editions.
          </p>

          {subscribed ? (
            <p className="mt-6 text-sm font-medium text-emerald-600">
              You&rsquo;re in! Watch for the next drop.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                aria-label="Email address"
              />
              <Button type="submit" variant="default">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
