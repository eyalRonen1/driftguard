import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let org;
  try {
    const result = await ensureUserAndOrg(user);
    org = result.org;
  } catch {
    return <p className="text-muted-foreground p-8 text-center">Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm
              email={user.email || ""}
              name={user.user_metadata?.full_name || ""}
            />
          </CardContent>
        </Card>

        {/* Plan - DYNAMIC from DB */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Plan & Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold capitalize">{org.plan}</p>
                  <Badge variant={org.plan === "business" ? "default" : org.plan === "pro" ? "secondary" : "outline"} className="text-[10px]">
                    {org.plan === "free" ? "Free" : org.plan === "pro" ? "Pro" : "Business"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checks this month</p>
                <p className="text-lg font-bold mt-1">{org.monthlyChecksUsed} / {org.monthlyCheckQuota}</p>
              </div>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="secondary" size="sm">
                {org.plan === "free" ? "Upgrade plan" : "Manage plan"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Danger */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Deleting your account removes all monitors and history permanently.
            </p>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
