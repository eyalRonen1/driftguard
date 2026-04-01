"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-jungle-stage flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <Image src="/assets/camo-sleep.png" alt="" width={80} height={80} className="mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Camo tripped on a vine. Let&apos;s try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
