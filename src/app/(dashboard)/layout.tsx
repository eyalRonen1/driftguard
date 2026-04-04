import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    await ensureUserAndOrg(user);
  } catch (err) {
    console.error("Failed to ensure user/org:", err);
  }

  return (
    <div className="min-h-screen bg-jungle-stage">
      <Sidebar user={user} />
      <CommandPalette />
      <main className="lg:ml-64 pt-16 lg:pt-6 pb-4 px-4 sm:pb-6 sm:px-6 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
