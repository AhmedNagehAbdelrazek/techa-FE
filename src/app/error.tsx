"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="mt-3 text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <div className="mt-8 flex gap-4">
            <Button onClick={reset} variant="default" size="lg">
              Try Again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
