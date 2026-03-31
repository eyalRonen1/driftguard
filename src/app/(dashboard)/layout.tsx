import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";

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
    <div className="min-h-screen bg-jungle-gradient">
      <div className="fixed inset-0 leaf-pattern pointer-events-none" />
      <Sidebar user={user} />
      <main className="lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
