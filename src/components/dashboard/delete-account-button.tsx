"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "deleting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setStep("deleting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account");
      }
      // Account deleted -- redirect to home
      router.push("/");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  if (step === "idle") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={() => setStep("confirm")}
      >
        Delete account
      </Button>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-destructive font-medium">
          Are you sure? This will permanently delete your account, all monitors,
          history, and alert configurations. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Yes, delete my account
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("idle")}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (step === "deleting") {
    return (
      <Button variant="outline" size="sm" disabled>
        Deleting...
      </Button>
    );
  }

  // error state
  return (
    <div className="space-y-2">
      <p className="text-xs text-destructive">{errorMsg}</p>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          Retry
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep("idle")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
