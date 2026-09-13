"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="p-10">
      <h1 className="mb-3 text-xl">Could not load this page</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Try again in a moment.
      </p>
      <Button variant="primary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
