"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChartNoAxesCombined, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, ErrorMessage } from "./ui/controls";

export function Login({
  development,
  google,
}: {
  development: boolean;
  google: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function signIn(local: boolean) {
    setBusy(true);
    setError(null);
    try {
      if (local) {
        const response = await fetch("/api/auth/dev-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (!response.ok) throw new Error("Local sign-in failed.");
        router.replace("/");
        router.refresh();
      } else {
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: "/",
        });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Sign-in failed."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ChartNoAxesCombined className="size-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Spending Insights
        </h1>
        <p className="mt-3 mb-8 leading-relaxed text-muted-foreground">
          Your accounts, bookings and spending in one place.
        </p>
        <div className="grid gap-3">
          {google && (
            <Button
              variant="primary"
              busy={busy}
              onClick={() => void signIn(false)}
            >
              Continue with Google <ArrowRight className="size-4" />
            </Button>
          )}
          {development && (
            <Button busy={busy} onClick={() => void signIn(true)}>
              Local development login
            </Button>
          )}
          {!google && !development && (
            <p className="text-sm text-muted-foreground">
              Sign-in is being configured. Please check back later.
            </p>
          )}
          <ErrorMessage error={error} />
        </div>
      </div>
    </main>
  );
}
