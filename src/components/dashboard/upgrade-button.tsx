"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpgradeButton({
  plan,
  label,
  variant,
  isCurrent,
}: {
  plan: string;
  label: string;
  variant: "default" | "secondary" | "outline";
  isCurrent: boolean;
}) {
  const [clicked, setClicked] = useState(false);

  if (isCurrent) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  if (clicked) {
    return (
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Checkout is being set up. Contact us to upgrade now:
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() =>
            window.open(
              `mailto:support@pagelifeguard.com?subject=Upgrade to ${plan}&body=I'd like to upgrade my account to the ${plan} plan.`,
              "_blank"
            )
          }
        >
          Email support@pagelifeguard.com
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      className="w-full"
      onClick={() => setClicked(true)}
    >
      {label}
    </Button>
  );
}
