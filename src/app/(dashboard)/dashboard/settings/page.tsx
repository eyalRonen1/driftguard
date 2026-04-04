import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let org;
  try {
    const result = await ensureUserAndOrg(user);
    org = result.org;
  } catch {
    return <p className="text-muted-foreground p-8 text-center">Loading...</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm
              email={user.email || ""}
              name={user.user_metadata?.full_name || ""}
              authProvider={user.app_metadata?.provider || "email"}
              timezone={org.timezone || "UTC"}
            />
          </CardContent>
        </Card>

        {/* Plan - DYNAMIC from DB */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Plan & Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold capitalize">{org.plan}</p>
                  <Badge variant={org.plan === "business" ? "default" : org.plan === "pro" ? "secondary" : "outline"} className="text-xs">
                    {org.plan === "free" ? "Free" : org.plan === "pro" ? "Pro" : "Business"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checks this month</p>
                <p className="text-xl font-bold mt-1">{org.monthlyChecksUsed} / {org.monthlyCheckQuota}</p>
              </div>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="secondary" size="sm">
                {org.plan === "free" ? "Upgrade plan" : "Manage plan"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className={org.plan !== "business" ? "opacity-60" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">API Keys</CardTitle>
              {org.plan !== "business" && (
                <Badge variant="outline" className="text-xs text-[var(--accent-gold)] border-[var(--accent-gold)]/30">
                  Business plan
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {org.plan === "business" ? (
              <ApiKeyManager />
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate API keys to connect external tools like Telegram bots, custom scripts, and integrations.
                </p>
                <Link href="/dashboard/billing">
                  <Button variant="secondary" size="sm">
                    Upgrade to Business
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Deleting your account removes all monitors and history permanently.
            </p>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
