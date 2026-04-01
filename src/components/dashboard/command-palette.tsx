"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import Image from "next/image";

/**
 * Command Palette (⌘K) - Spotlight-style search and navigation.
 * Like Linear, Vercel, Raycast - the mark of a premium product.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle with ⌘K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function navigate(path: string) {
    setOpen(false);
    router.push(path);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg">
        <Command className="rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <Command.Input
              placeholder="Search or jump to..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              <Image src="/assets/camo-happy.png" alt="" width={32} height={32} className="mx-auto mb-2 opacity-50" />
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigate" className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">
              <CommandItem icon="📊" label="Dashboard" shortcut="G D" onSelect={() => navigate("/dashboard")} />
              <CommandItem icon="👁" label="Monitors" shortcut="G M" onSelect={() => navigate("/dashboard/monitors")} />
              <CommandItem icon="💳" label="Billing" shortcut="G B" onSelect={() => navigate("/dashboard/billing")} />
              <CommandItem icon="⚙️" label="Settings" shortcut="G S" onSelect={() => navigate("/dashboard/settings")} />
            </Command.Group>

            <Command.Separator className="my-1 border-t border-border/20" />

            <Command.Group heading="Actions" className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">
              <CommandItem icon="➕" label="Add new monitor" onSelect={() => navigate("/dashboard/monitors/new")} />
              <CommandItem icon="🔄" label="Check all monitors" onSelect={async () => {
                setOpen(false);
                try {
                  const res = await fetch("/api/v1/monitors");
                  const data = await res.json();
                  const monitorsList = data.monitors || [];
                  await Promise.allSettled(
                    monitorsList.map((m: any) => fetch(`/api/v1/monitors/${m.id}/check`, { method: "POST" }))
                  );
                  window.location.reload();
                } catch {}
              }} />
              <CommandItem icon="🔔" label="Notification settings" onSelect={() => navigate("/dashboard/settings")} />
            </Command.Group>

            <Command.Separator className="my-1 border-t border-border/20" />

            <Command.Group heading="Help" className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">
              <CommandItem icon="❓" label="Keyboard shortcuts" onSelect={() => { setOpen(false); }} />
              <CommandItem icon="📖" label="Documentation" onSelect={() => window.open("https://pagelifeguard.com", "_blank")} />
              <CommandItem icon="🦎" label="About Camo" onSelect={() => { setOpen(false); }} />
            </Command.Group>
          </Command.List>

          <div className="border-t border-border/20 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>⌘K Toggle</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && <kbd className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{shortcut}</kbd>}
    </Command.Item>
  );
}
